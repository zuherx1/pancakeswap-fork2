import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyToken } from './login';

const DATA_FILE = path.join(process.cwd(), 'data', 'admin.json');

export function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function authCheck(req: NextApiRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return verifyToken(token) !== null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Public GET for site settings (no auth needed — frontend needs these)
  if (req.method === 'GET') {
    const data = readData();
    const { section } = req.query;
    if (section) {
      return res.status(200).json(data[section as string] ?? {});
    }
    // Return public-safe data only
    const { admins, ...publicData } = data;
    return res.status(200).json(publicData);
  }

  // All write operations require auth
  if (!authCheck(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const data = readData();
    const { section, payload } = req.body;
    if (!section || payload === undefined) return res.status(400).json({ error: 'Missing section or payload' });
    // Arrays (like blogPosts, tokens, etc.) replace entirely; objects get merged
    if (Array.isArray(payload)) {
      data[section] = payload;
    } else {
      data[section] = { ...(data[section] || {}), ...payload };
    }
    writeData(data);
    return res.status(200).json({ success: true, data: data[section] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
