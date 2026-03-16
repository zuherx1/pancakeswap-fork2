import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'data', 'admin.json');

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function simpleHash(password: string): string {
  return crypto.createHash('sha256').update(password + 'pcs_salt_2025').digest('hex');
}

function generateToken(adminId: string): string {
  const payload = { id: adminId, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): { id: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (payload.exp < Date.now()) return null;
    return { id: payload.id };
  } catch {
    return null;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const data = readData();
  const admin = data.admins.find((a: any) =>
    a.username === username &&
    (a.passwordHash === simpleHash(password) || a.passwordHash === password)
  );

  if (!admin) return res.status(401).json({ error: 'Invalid username or password' });

  const token = generateToken(admin.id);
  return res.status(200).json({
    token,
    admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
  });
}
