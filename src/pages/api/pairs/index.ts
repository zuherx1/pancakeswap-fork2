import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../admin/login';
import { readData, writeData } from '../admin/data';

function auth(req: NextApiRequest) {
  const t = req.headers.authorization?.replace('Bearer ', '');
  return t ? verifyToken(t) !== null : false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET — public
  if (req.method === 'GET') {
    const data = readData();
    return res.status(200).json(data.marketPairs || []);
  }

  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // POST — create pair
  if (req.method === 'POST') {
    const { fromTokenId, toTokenId, initialPrice, fee, enabled } = req.body;
    if (!fromTokenId || !toTokenId || !initialPrice) {
      return res.status(400).json({ error: 'fromTokenId, toTokenId, and initialPrice are required' });
    }

    const data  = readData();
    const tokens = data.tokens || [];

    const fromToken = tokens.find((t: any) => t.id === fromTokenId);
    const toToken   = tokens.find((t: any) => t.id === toTokenId);

    if (!fromToken || !toToken) {
      return res.status(400).json({ error: 'One or both tokens not found' });
    }

    if (!Array.isArray(data.marketPairs)) data.marketPairs = [];

    // Check duplicate
    const exists = data.marketPairs.find(
      (p: any) => p.fromTokenId === fromTokenId && p.toTokenId === toTokenId
    );
    if (exists) return res.status(400).json({ error: 'Market pair already exists' });

    const newPair = {
      id:           Date.now().toString(),
      fromTokenId,
      toTokenId,
      fromSymbol:   fromToken.symbol,
      toSymbol:     toToken.symbol,
      fromChain:    fromToken.chain,
      toChain:      toToken.chain,
      currentPrice: parseFloat(initialPrice),
      initialPrice: parseFloat(initialPrice),
      fee:          parseFloat(fee) || 0.25,
      enabled:      enabled !== false,
      volume24h:    0,
      liquidity:    0,
      createdAt:    new Date().toISOString(),
    };

    data.marketPairs.push(newPair);
    writeData(data);
    return res.status(201).json({ success: true, pair: newPair });
  }

  // PUT — update price or settings
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const data = readData();
    const idx  = data.marketPairs?.findIndex((p: any) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Pair not found' });

    data.marketPairs[idx] = { ...data.marketPairs[idx], ...updates };
    writeData(data);
    return res.status(200).json({ success: true, pair: data.marketPairs[idx] });
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const data = readData();
    data.marketPairs = (data.marketPairs || []).filter((p: any) => p.id !== id);
    writeData(data);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
