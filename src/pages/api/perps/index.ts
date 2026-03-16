import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../admin/login';
import { readData, writeData } from '../admin/data';

function auth(req: NextApiRequest) {
  const t = req.headers.authorization?.replace('Bearer ', '');
  return t ? verifyToken(t) !== null : false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  // ── GET public markets list ────────────────────────────────────────────
  if (req.method === 'GET' && action === 'markets') {
    const data = readData();
    return res.status(200).json(data.localPerpsMarkets || []);
  }

  // ── GET/POST positions (user positions — stored in session, not server) ─
  if (req.method === 'GET' && action === 'settings') {
    const data = readData();
    return res.status(200).json(data.perpsSettings || { mode: 'fork' });
  }

  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // ── POST — add new market ──────────────────────────────────────────────
  if (req.method === 'POST' && action === 'add-market') {
    const {
      symbol, baseAsset, quoteAsset,
      initialPrice, maxLeverage,
      fundingRate, makerFee, takerFee,
      enabled,
    } = req.body;

    if (!symbol || !baseAsset || !quoteAsset || !initialPrice) {
      return res.status(400).json({ error: 'symbol, baseAsset, quoteAsset, and initialPrice are required' });
    }

    const data = readData();
    if (!Array.isArray(data.localPerpsMarkets)) data.localPerpsMarkets = [];

    // Check duplicate
    if (data.localPerpsMarkets.find((m: any) => m.symbol === symbol.toUpperCase())) {
      return res.status(400).json({ error: 'Market already exists' });
    }

    const newMarket = {
      id:            Date.now().toString(),
      symbol:        symbol.toUpperCase(),
      baseAsset:     baseAsset.toUpperCase(),
      quoteAsset:    quoteAsset.toUpperCase(),
      markPrice:     parseFloat(initialPrice),
      indexPrice:    parseFloat(initialPrice),
      initialPrice:  parseFloat(initialPrice),
      fundingRate:   parseFloat(fundingRate) || 0.0001,
      nextFunding:   '08:00:00',
      openInterest:  0,
      volume24h:     0,
      change24h:     0,
      high24h:       parseFloat(initialPrice) * 1.02,
      low24h:        parseFloat(initialPrice) * 0.98,
      maxLeverage:   parseInt(maxLeverage) || 50,
      makerFee:      parseFloat(makerFee) || 0.02,
      takerFee:      parseFloat(takerFee) || 0.07,
      enabled:       enabled !== false,
      isLocal:       true,
      createdAt:     new Date().toISOString(),
    };

    data.localPerpsMarkets.push(newMarket);
    writeData(data);
    return res.status(201).json({ success: true, market: newMarket });
  }

  // ── PUT — update market price / settings ──────────────────────────────
  if (req.method === 'PUT' && action === 'update-market') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const data = readData();
    const idx  = data.localPerpsMarkets?.findIndex((m: any) => m.id === id);
    if (idx === -1 || idx === undefined) return res.status(404).json({ error: 'Market not found' });

    data.localPerpsMarkets[idx] = { ...data.localPerpsMarkets[idx], ...updates };
    writeData(data);
    return res.status(200).json({ success: true, market: data.localPerpsMarkets[idx] });
  }

  // ── DELETE — remove market ─────────────────────────────────────────────
  if (req.method === 'DELETE' && action === 'delete-market') {
    const { id } = req.query;
    const data = readData();
    data.localPerpsMarkets = (data.localPerpsMarkets || []).filter((m: any) => m.id !== id);
    writeData(data);
    return res.status(200).json({ success: true });
  }

  // ── POST — toggle perps mode (fork vs local) ───────────────────────────
  if (req.method === 'POST' && action === 'set-mode') {
    const { mode } = req.body;
    const data = readData();
    data.perpsSettings = { ...data.perpsSettings, mode };
    writeData(data);
    return res.status(200).json({ success: true, mode });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
