import type { NextApiRequest, NextApiResponse } from 'next';
import { readData, writeData } from '../admin/data';
import { TatumAPI } from '../../../utils/tatum-server';

function getTatum(): TatumAPI | null {
  const data = readData();
  const key  = data?.tatumSettings?.apiKey;
  if (!key) return null;
  return new TatumAPI(key, data.tatumSettings?.testnet || false);
}

// ── GET /api/exchange?action=pairs  → public list of active pairs + liquidity
// ── GET /api/exchange?action=quote  → get price quote for a swap
// ── POST /api/exchange?action=swap  → record a swap (user pays → exchange wallet)
// ── POST /api/exchange?action=complete → send from exchange wallet to user

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  const data = readData();

  // ── Return active market pairs with liquidity info ─────────────────────
  if (action === 'pairs' && req.method === 'GET') {
    const pairs  = (data.marketPairs || []).filter((p: any) => p.enabled);
    const tokens = data.tokens || [];
    const wallets = data.exchangeWallets || [];

    const enriched = pairs.map((pair: any) => {
      const fromToken = tokens.find((t: any) => t.id === pair.fromTokenId);
      const toToken   = tokens.find((t: any) => t.id === pair.toTokenId);

      // Check if exchange wallets exist for both tokens
      const fromWallet = wallets.find((w: any) =>
        w.tokenId === pair.fromTokenId ||
        (w.chain === fromToken?.chain && !w.tokenId && !fromToken?.contractAddress)
      );
      const toWallet = wallets.find((w: any) =>
        w.tokenId === pair.toTokenId ||
        (w.chain === toToken?.chain && !w.tokenId && !toToken?.contractAddress)
      );

      const hasLiquidity =
        fromWallet && toWallet &&
        parseFloat(toWallet.balance || '0') > 0;

      return {
        ...pair,
        fromToken: fromToken ? {
          id:              fromToken.id,
          name:            fromToken.name,
          symbol:          fromToken.symbol,
          logoEmoji:       fromToken.logoEmoji,
          logoUrl:         fromToken.logoUrl,
          chain:           fromToken.chain,
          decimals:        fromToken.decimals,
          contractAddress: fromToken.contractAddress,
        } : null,
        toToken: toToken ? {
          id:              toToken.id,
          name:            toToken.name,
          symbol:          toToken.symbol,
          logoEmoji:       toToken.logoEmoji,
          logoUrl:         toToken.logoUrl,
          chain:           toToken.chain,
          decimals:        toToken.decimals,
          contractAddress: toToken.contractAddress,
        } : null,
        hasLiquidity,
        fromWalletAddress: fromWallet?.address || null,
        toWalletAddress:   toWallet?.address   || null,
        toWalletBalance:   toWallet?.balance   || '0',
      };
    }).filter((p: any) => p.fromToken && p.toToken);

    return res.status(200).json(enriched);
  }

  // ── Get price quote ────────────────────────────────────────────────────
  if (action === 'quote' && req.method === 'GET') {
    const { pairId, fromAmount } = req.query;
    const pair = data.marketPairs?.find((p: any) => p.id === pairId);
    if (!pair) return res.status(404).json({ error: 'Pair not found' });

    const amount     = parseFloat(fromAmount as string) || 0;
    const price      = pair.currentPrice || pair.initialPrice || 0;
    const fee        = pair.fee || 0.25;
    const grossOut   = amount * price;
    const feeAmount  = grossOut * (fee / 100);
    const netOut     = grossOut - feeAmount;

    // Check liquidity
    const wallets = data.exchangeWallets || [];
    const tokens  = data.tokens || [];
    const toToken = tokens.find((t: any) => t.id === pair.toTokenId);
    const toWallet = wallets.find((w: any) =>
      w.tokenId === pair.toTokenId ||
      (w.chain === toToken?.chain && !w.tokenId && !toToken?.contractAddress)
    );
    const hasLiquidity = toWallet && parseFloat(toWallet.balance || '0') >= netOut;

    return res.status(200).json({
      fromAmount:    amount,
      toAmount:      netOut,
      grossAmount:   grossOut,
      feeAmount,
      feePercent:    fee,
      price,
      hasLiquidity:  !!hasLiquidity,
      toBalance:     toWallet?.balance || '0',
      depositAddress: null, // set after swap is initiated
    });
  }

  // ── Initiate swap — return exchange wallet deposit address ─────────────
  if (action === 'swap' && req.method === 'POST') {
    const { pairId, fromAmount, userAddress } = req.body;
    if (!pairId || !fromAmount || !userAddress) {
      return res.status(400).json({ error: 'pairId, fromAmount, and userAddress required' });
    }

    const pair = data.marketPairs?.find((p: any) => p.id === pairId);
    if (!pair) return res.status(404).json({ error: 'Pair not found' });

    const tokens  = data.tokens || [];
    const wallets = data.exchangeWallets || [];
    const fromToken = tokens.find((t: any) => t.id === pair.fromTokenId);
    const toToken   = tokens.find((t: any) => t.id === pair.toTokenId);

    const fromWallet = wallets.find((w: any) =>
      w.tokenId === pair.fromTokenId ||
      (w.chain === fromToken?.chain && !w.tokenId && !fromToken?.contractAddress)
    );
    const toWallet = wallets.find((w: any) =>
      w.tokenId === pair.toTokenId ||
      (w.chain === toToken?.chain && !w.tokenId && !toToken?.contractAddress)
    );

    if (!fromWallet) {
      return res.status(400).json({ error: `No exchange wallet found for ${fromToken?.symbol}` });
    }
    if (!toWallet) {
      return res.status(400).json({ error: `No exchange wallet found for ${toToken?.symbol}` });
    }

    const price     = pair.currentPrice || pair.initialPrice || 0;
    const fee       = pair.fee || 0.25;
    const grossOut  = parseFloat(fromAmount) * price;
    const feeAmt    = grossOut * (fee / 100);
    const netOut    = grossOut - feeAmt;

    if (parseFloat(toWallet.balance || '0') < netOut) {
      return res.status(400).json({
        error: 'Insufficient liquidity',
        noLiquidity: true,
        available: toWallet.balance,
        required:  netOut.toFixed(8),
      });
    }

    // Create pending swap record
    const swapRecord = {
      id:           `swap-${Date.now()}`,
      pairId,
      fromTokenId:  pair.fromTokenId,
      toTokenId:    pair.toTokenId,
      fromSymbol:   fromToken?.symbol,
      toSymbol:     toToken?.symbol,
      fromAmount:   parseFloat(fromAmount),
      toAmount:     netOut,
      feeAmount:    feeAmt,
      userAddress,
      depositAddress: fromWallet.address,
      toWalletId:   toWallet.id,
      status:       'pending_deposit',
      createdAt:    new Date().toISOString(),
    };

    if (!Array.isArray(data.swapHistory)) data.swapHistory = [];
    data.swapHistory.push(swapRecord);
    writeData(data);

    return res.status(201).json({
      success:        true,
      swapId:         swapRecord.id,
      depositAddress: fromWallet.address,
      fromAmount:     swapRecord.fromAmount,
      toAmount:       netOut,
      feeAmount:      feeAmt,
      message:        `Send ${fromAmount} ${fromToken?.symbol} to the deposit address. We will send ${netOut.toFixed(6)} ${toToken?.symbol} to your wallet.`,
    });
  }

  // ── Complete swap — send from exchange wallet to user ──────────────────
  // This is called by admin or automated system after deposit is confirmed
  if (action === 'complete' && req.method === 'POST') {
    const { swapId } = req.body;
    const swap = data.swapHistory?.find((s: any) => s.id === swapId);
    if (!swap) return res.status(404).json({ error: 'Swap not found' });
    if (swap.status !== 'pending_deposit') {
      return res.status(400).json({ error: 'Swap is not in pending state' });
    }

    const tatum = getTatum();
    if (!tatum) return res.status(400).json({ error: 'Tatum API not configured' });

    const wallets   = data.exchangeWallets || [];
    const toWallet  = wallets.find((w: any) => w.id === swap.toWalletId);
    if (!toWallet) return res.status(404).json({ error: 'Exchange wallet not found' });

    try {
      const tokens  = data.tokens || [];
      const toToken = tokens.find((t: any) => t.id === swap.toTokenId);

      const tx = await tatum.sendFromExchangeWallet({
        chain:           toWallet.chain,
        fromPrivateKey:  toWallet.privateKey,
        toAddress:       swap.userAddress,
        amount:          swap.toAmount.toString(),
        contractAddress: toToken?.contractAddress,
        tokenDecimals:   toToken?.decimals || 18,
      });

      // Update swap status
      data.swapHistory = data.swapHistory.map((s: any) =>
        s.id === swapId
          ? { ...s, status: 'completed', txId: tx.txId, completedAt: new Date().toISOString() }
          : s
      );

      // Update wallet balance (deduct)
      const wIdx = wallets.findIndex((w: any) => w.id === swap.toWalletId);
      if (wIdx !== -1) {
        const newBal = Math.max(0, parseFloat(toWallet.balance || '0') - swap.toAmount);
        data.exchangeWallets[wIdx].balance = newBal.toString();
      }

      writeData(data);
      return res.status(200).json({ success: true, txId: tx.txId });
    } catch (e: any) {
      data.swapHistory = data.swapHistory.map((s: any) =>
        s.id === swapId ? { ...s, status: 'failed', error: e.message } : s
      );
      writeData(data);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
