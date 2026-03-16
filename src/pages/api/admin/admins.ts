import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { readData, writeData } from './data';
import { verifyToken } from './login';

function simpleHash(password: string): string {
  return crypto.createHash('sha256').update(password + 'pcs_salt_2025').digest('hex');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!auth || !verifyToken(auth)) return res.status(401).json({ error: 'Unauthorized' });

  const data = readData();

  if (req.method === 'GET') {
    return res.status(200).json(data.admins.map((a: any) => ({ ...a, passwordHash: undefined })));
  }

  if (req.method === 'POST') {
    const { username, password, email, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (data.admins.find((a: any) => a.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const newAdmin = {
      id: Date.now().toString(),
      username,
      passwordHash: simpleHash(password),
      email: email || '',
      role: role || 'admin',
      createdAt: new Date().toISOString(),
    };
    data.admins.push(newAdmin);
    writeData(data);
    return res.status(201).json({ success: true, admin: { ...newAdmin, passwordHash: undefined } });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const idx = data.admins.findIndex((a: any) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Admin not found' });
    if (data.admins[idx].role === 'superadmin' && data.admins.filter((a: any) => a.role === 'superadmin').length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last superadmin' });
    }
    data.admins.splice(idx, 1);
    writeData(data);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
