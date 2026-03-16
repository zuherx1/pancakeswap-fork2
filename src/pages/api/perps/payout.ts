import type { NextApiRequest, NextApiResponse } from 'next';
import { readData, writeData } from '../admin/data';
import { TatumAPI } from '../../../utils/tatum-server';

function getTatum(): TatumAPI | null {
  const data = readData();
  const key  = data?.tatumSettings?.apiKey;
  if (!key) return null;
  return new TatumAPI(key, data.tatumSettings?.testnet || false);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  // ── POST close-position: calculate PnL and pay out winnings ───────────
  if (req.method === 'POST' && action === 'close-position') {
    const {
      marketSymbol,   // e.g. "BTCUSDT"
      side,           // 'long' | 'short'
      size,           // number of contracts
      entryPrice,     // price when opened
      closePrice,     // current mark price
      leverage,
      margin,         // initial margin in USDT
      userAddress,    // user's wallet address
      quoteAsset,     // e.g. "USDT"
    } = req.body;

    if (!marketSymbol || !side || !size || !entryPrice || !closePrice || !userAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ── Calculate PnL ──────────────────────────────────────────────────
    const rawPnl = side === 'long'
      ? (closePrice - entryPrice) * size
      : (entryPrice - closePrice) * size;

    const data         = readData();
    const perpsMarket  = data.localPerpsMarkets?.find((m: any) => m.symbol === marketSymbol);
    const takerFeeRate = (perpsMarket?.takerFee || 0.07) / 100;
    const closingFee   = Math.abs(size * closePrice * takerFeeRate);
    const netPnl       = rawPnl - closingFee;

    // ── If user lost — nothing to pay out ─────────────────────────────
    if (netPnl <= 0) {
      // Record the loss (margin was already at risk)
      const lossRecord = {
        id:          `pnl-${Date.now()}`,
        type:        'loss',
        marketSymbol,
        side,
        size,
        entryPrice,
        closePrice,
        pnl:         netPnl,
        fee:         closingFee,
        userAddress,
        timestamp:   new Date().toISOString(),
      };
      if (!Array.isArray(data.perpsHistory)) data.perpsHistory = [];
      data.perpsHistory.unshift(lossRecord);
      writeData(data);

      return res.status(200).json({
        success:   true,
        pnl:       netPnl,
        payout:    0,
        message:   'Position closed. No payout — position closed at a loss.',
        txId:      null,
      });
    }

    // ── User won — pay out margin + profit from exchange wallet ────────
    const payout = margin + netPnl;  // return margin + profit

    // Find the exchange wallet for the quote asset
    const tokens  = data.tokens || [];
    const wallets = data.exchangeWallets || [];

    // Find a wallet that holds USDT/USDC (quote asset) on any EVM chain
    const payoutWallet = wallets.find((w: any) => {
      const tok = w.tokenId ? tokens.find((t: any) => t.id === w.tokenId) : null;
      if (tok) return tok.symbol === quoteAsset;
      // Native coin wallet — check by chain symbol
      const { TATUM_CHAINS } = require('../../../utils/tatum');
      const chainInfo = TATUM_CHAINS[w.chain];
      return chainInfo?.symbol === quoteAsset;
    }) || wallets.find((w: any) => !w.tokenId && (w.chain === 'BSC' || w.chain === 'ETH')); // fallback

    if (!payoutWallet) {
      return res.status(400).json({
        error:       'No exchange wallet found to pay out winnings. Contact support.',
        pnl:         netPnl,
        payout:      payout,
        noWallet:    true,
      });
    }

    // Check wallet has enough balance
    const walletBalance = parseFloat(payoutWallet.balance || '0');
    if (walletBalance < payout) {
      return res.status(400).json({
        error:             `Insufficient exchange wallet balance. Available: ${walletBalance} ${quoteAsset}, Required: ${payout.toFixed(6)} ${quoteAsset}`,
        pnl:               netPnl,
        payout:            payout,
        insufficientFunds: true,
        available:         walletBalance,
      });
    }

    // ── Execute payout via Tatum ───────────────────────────────────────
    const tatum = getTatum();
    if (!tatum) {
      // Record pending payout if Tatum not configured
      const pendingRecord = {
        id:          `pnl-${Date.now()}`,
        type:        'win_pending',
        marketSymbol,
        side,
        size,
        entryPrice,
        closePrice,
        pnl:         netPnl,
        payout,
        fee:         closingFee,
        userAddress,
        walletId:    payoutWallet.id,
        txId:        null,
        status:      'pending',
        note:        'Tatum API not configured — payout pending manual processing',
        timestamp:   new Date().toISOString(),
      };
      if (!Array.isArray(data.perpsHistory)) data.perpsHistory = [];
      data.perpsHistory.unshift(pendingRecord);
      writeData(data);

      return res.status(200).json({
        success:    true,
        pnl:        netPnl,
        payout,
        txId:       null,
        pending:    true,
        message:    `You won ${netPnl.toFixed(6)} ${quoteAsset}! Payout of ${payout.toFixed(6)} ${quoteAsset} is pending (Tatum not configured).`,
      });
    }

    try {
      const tok = payoutWallet.tokenId
        ? tokens.find((t: any) => t.id === payoutWallet.tokenId)
        : null;

      const tx = await tatum.sendFromExchangeWallet({
        chain:           payoutWallet.chain,
        fromPrivateKey:  payoutWallet.privateKey,
        toAddress:       userAddress,
        amount:          payout.toFixed(6),
        contractAddress: tok?.contractAddress,
        tokenDecimals:   tok?.decimals || 18,
      });

      // Update wallet balance
      const wIdx = data.exchangeWallets.findIndex((w: any) => w.id === payoutWallet.id);
      if (wIdx !== -1) {
        const newBal = Math.max(0, walletBalance - payout);
        data.exchangeWallets[wIdx].balance = newBal.toString();
      }

      // Record the winning
      const winRecord = {
        id:          `pnl-${Date.now()}`,
        type:        'win',
        marketSymbol,
        side,
        size,
        entryPrice,
        closePrice,
        pnl:         netPnl,
        payout,
        fee:         closingFee,
        userAddress,
        walletId:    payoutWallet.id,
        txId:        tx.txId,
        status:      'sent',
        timestamp:   new Date().toISOString(),
      };
      if (!Array.isArray(data.perpsHistory)) data.perpsHistory = [];
      data.perpsHistory.unshift(winRecord);

      // Update market volume
      const mIdx = data.localPerpsMarkets?.findIndex((m: any) => m.symbol === marketSymbol);
      if (mIdx !== undefined && mIdx !== -1) {
        data.localPerpsMarkets[mIdx].volume24h =
          (data.localPerpsMarkets[mIdx].volume24h || 0) + Math.abs(size * closePrice);
      }

      writeData(data);

      return res.status(200).json({
        success: true,
        pnl:     netPnl,
        payout,
        fee:     closingFee,
        txId:    tx.txId,
        message: `You won ${netPnl.toFixed(6)} ${quoteAsset}! ${payout.toFixed(6)} ${quoteAsset} sent to your wallet.`,
      });
    } catch (e: any) {
      return res.status(500).json({
        error:   `Payout failed: ${e.message}`,
        pnl:     netPnl,
        payout,
        txId:    null,
      });
    }
  }

  // ── GET history — admin view of all payouts ────────────────────────────
  if (req.method === 'GET' && action === 'history') {
    const data = readData();
    return res.status(200).json(data.perpsHistory || []);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
