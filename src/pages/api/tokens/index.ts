import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../admin/login';
import { readData, writeData } from '../admin/data';

function auth(req: NextApiRequest) {
  const t = req.headers.authorization?.replace('Bearer ', '');
  return t ? verifyToken(t) !== null : false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET — public, frontend needs token list
  if (req.method === 'GET') {
    const data = readData();
    return res.status(200).json(data.tokens || []);
  }

  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // POST — add new token
  if (req.method === 'POST') {
    const { name, symbol, logoUrl, logoEmoji, contractAddress, chain, decimals, initialPrice } = req.body;
    if (!name || !symbol || !chain) {
      return res.status(400).json({ error: 'name, symbol, and chain are required' });
    }

    const data = readData();
    if (!Array.isArray(data.tokens)) data.tokens = [];

    const newToken = {
      id:              Date.now().toString(),
      name,
      symbol:          symbol.toUpperCase(),
      logoUrl:         logoUrl  || '',
      logoEmoji:       logoEmoji || '🪙',
      contractAddress: contractAddress || '',
      chain,
      decimals:        parseInt(decimals) || 18,
      initialPrice:    parseFloat(initialPrice) || 0,
      addedAt:         new Date().toISOString(),
      enabled:         true,
    };

    data.tokens.push(newToken);
    writeData(data);
    return res.status(201).json({ success: true, token: newToken });
  }

  // PUT — update token
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const data = readData();
    const idx  = data.tokens?.findIndex((t: any) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Token not found' });

    data.tokens[idx] = { ...data.tokens[idx], ...updates };
    writeData(data);
    return res.status(200).json({ success: true, token: data.tokens[idx] });
  }

  // DELETE — remove token
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const data = readData();
    data.tokens = (data.tokens || []).filter((t: any) => t.id !== id);
    writeData(data);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
