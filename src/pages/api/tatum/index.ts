import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../admin/login';
import { readData, writeData } from '../admin/data';
import { TatumAPI } from '../../../utils/tatum-server';
import { TATUM_CHAINS } from '../../../utils/tatum';

function auth(req: NextApiRequest) {
  const t = req.headers.authorization?.replace('Bearer ', '');
  return t ? verifyToken(t) !== null : false;
}

function getTatum(): TatumAPI | null {
  const data = readData();
  const key  = data?.tatumSettings?.apiKey;
  if (!key) return null;
  return new TatumAPI(key, data.tatumSettings.testnet || false);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  // ── Verify API key (public endpoint for admin setup) ───────────────────
  if (action === 'verify' && req.method === 'GET') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const tatum = getTatum();
    if (!tatum) return res.status(400).json({ error: 'Tatum API key not configured' });
    try {
      const ok = await tatum.verify();
      return res.status(200).json({ valid: ok });
    } catch (e: any) {
      return res.status(200).json({ valid: false, error: e.message });
    }
  }

  // ── Generate wallet ────────────────────────────────────────────────────
  if (action === 'generate-wallet' && req.method === 'POST') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { chain, tokenId } = req.body;
    if (!chain) return res.status(400).json({ error: 'Chain required' });

    const tatum = getTatum();
    if (!tatum) return res.status(400).json({ error: 'Tatum API key not configured. Please add your API key in Tatum.io settings.' });

    try {
      const wallet = await tatum.generateWallet(chain);
      const data   = readData();

      // Save exchange wallet (store encrypted in production!)
      const walletRecord = {
        id:              `${tokenId || chain}-${Date.now()}`,
        tokenId:         tokenId || null,
        chain,
        address:         wallet.address,
        privateKey:      wallet.privateKey || '',   // ⚠️ encrypt in production
        balance:         '0',
        createdAt:       new Date().toISOString(),
      };

      if (!Array.isArray(data.exchangeWallets)) data.exchangeWallets = [];
      data.exchangeWallets.push(walletRecord);
      writeData(data);

      // Return without private key to client
      const { privateKey, ...safeWallet } = walletRecord;
      return res.status(201).json({ success: true, wallet: safeWallet });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Wallet generation failed' });
    }
  }

  // ── Get balance ────────────────────────────────────────────────────────
  if (action === 'balance' && req.method === 'GET') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { walletId } = req.query;
    const data = readData();
    const wallet = data.exchangeWallets?.find((w: any) => w.id === walletId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const tatum = getTatum();
    if (!tatum) return res.status(400).json({ error: 'Tatum API key not configured' });

    try {
      // Get token contract address if applicable
      const token = wallet.tokenId
        ? data.tokens?.find((t: any) => t.id === wallet.tokenId)
        : null;
      const contractAddress = token?.contractAddress || undefined;

      const balance = await tatum.getBalance(wallet.chain, wallet.address, contractAddress);

      // Update stored balance
      data.exchangeWallets = data.exchangeWallets.map((w: any) =>
        w.id === walletId ? { ...w, balance } : w
      );
      writeData(data);

      return res.status(200).json({ balance, address: wallet.address });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Add liquidity to exchange wallet ──────────────────────────────────
  if (action === 'add-liquidity' && req.method === 'POST') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { walletId, amount, note } = req.body;
    const data = readData();
    const wIdx = data.exchangeWallets?.findIndex((w: any) => w.id === walletId);
    if (wIdx === -1) return res.status(404).json({ error: 'Wallet not found' });

    // Record liquidity addition (actual funding happens externally by sending to wallet address)
    if (!data.exchangeWallets[wIdx].liquidityHistory) {
      data.exchangeWallets[wIdx].liquidityHistory = [];
    }
    data.exchangeWallets[wIdx].liquidityHistory.push({
      type:      'add',
      amount,
      note:      note || 'Manual liquidity addition',
      timestamp: new Date().toISOString(),
    });
    writeData(data);

    return res.status(200).json({ success: true, message: `Liquidity record added. Send ${amount} to ${data.exchangeWallets[wIdx].address} to fund the wallet.` });
  }

  // ── Send from exchange wallet (swap execution) ─────────────────────────
  if (action === 'send' && req.method === 'POST') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { walletId, toAddress, amount } = req.body;
    const data = readData();
    const wallet = data.exchangeWallets?.find((w: any) => w.id === walletId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const tatum = getTatum();
    if (!tatum) return res.status(400).json({ error: 'Tatum API key not configured' });

    try {
      const token = wallet.tokenId
        ? data.tokens?.find((t: any) => t.id === wallet.tokenId)
        : null;

      const tx = await tatum.sendFromExchangeWallet({
        chain:           wallet.chain,
        fromPrivateKey:  wallet.privateKey,
        toAddress,
        amount,
        contractAddress: token?.contractAddress,
        tokenDecimals:   token?.decimals || 18,
      });

      return res.status(200).json({ success: true, txId: tx.txId });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── Get all wallets ────────────────────────────────────────────────────
  if (action === 'wallets' && req.method === 'GET') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const data = readData();
    // Never return private keys
    const safeWallets = (data.exchangeWallets || []).map(({ privateKey, ...w }: any) => w);
    return res.status(200).json(safeWallets);
  }

  // ── Delete wallet ─────────────────────────────────────────────────────
  if (action === 'delete-wallet' && req.method === 'DELETE') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { walletId } = req.query;
    const data = readData();
    data.exchangeWallets = (data.exchangeWallets || []).filter((w: any) => w.id !== walletId);
    writeData(data);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
