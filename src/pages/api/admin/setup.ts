import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'admin.json');

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'pcs_salt_2025').digest('hex');
}

const DEFAULT_HASH = hashPassword('admin123');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  // ── Check if setup is needed ────────────────────────────────────────
  if (req.method === 'GET' && action === 'check') {
    const data = readData();
    const admin = data.admins?.[0];
    const needsSetup = !admin || admin.passwordHash === DEFAULT_HASH;
    return res.status(200).json({ needsSetup, hasAdmins: !!admin });
  }

  // ── First-time setup ────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'setup') {
    const { username, password, email, siteName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const data  = readData();
    const admin = data.admins?.[0];

    // Only allow setup if still using default password
    if (admin && admin.passwordHash !== DEFAULT_HASH) {
      return res.status(403).json({ error: 'Setup already completed. Use Reset Password instead.' });
    }

    // Update admin credentials
    data.admins = [{
      id:           admin?.id || '1',
      username:     username.trim(),
      passwordHash: hashPassword(password),
      email:        email || '',
      role:         'superadmin',
      createdAt:    new Date().toISOString(),
      setupAt:      new Date().toISOString(),
    }];

    // Update site name if provided
    if (siteName) {
      data.siteSettings = { ...(data.siteSettings || {}), siteName: siteName.trim() };
    }

    // Mark setup as complete
    data.setupCompleted = true;
    data.setupCompletedAt = new Date().toISOString();

    writeData(data);

    return res.status(200).json({
      success: true,
      message: 'Setup completed! You can now log in with your new credentials.',
    });
  }

  // ── Reset password (requires current password) ──────────────────────
  if (req.method === 'POST' && action === 'reset-password') {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const data  = readData();
    const admin = data.admins?.find((a: any) => a.username === username);

    if (!admin) {
      return res.status(404).json({ error: 'Username not found' });
    }

    // Verify current password
    const currentHash = hashPassword(currentPassword);
    if (admin.passwordHash !== currentHash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    data.admins = data.admins.map((a: any) =>
      a.username === username
        ? { ...a, passwordHash: hashPassword(newPassword), passwordChangedAt: new Date().toISOString() }
        : a
    );
    writeData(data);

    return res.status(200).json({ success: true, message: 'Password updated successfully!' });
  }

  // ── Emergency reset via setup key ───────────────────────────────────
  // If you forget your password, set SETUP_RESET_KEY in .env and use it here
  if (req.method === 'POST' && action === 'emergency-reset') {
    const { setupKey, username, newPassword } = req.body;
    const envKey = process.env.SETUP_RESET_KEY;

    if (!envKey) {
      return res.status(403).json({ error: 'SETUP_RESET_KEY not configured in .env.local' });
    }
    if (setupKey !== envKey) {
      return res.status(401).json({ error: 'Invalid setup key' });
    }
    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Username and new password required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const data  = readData();
    const admin = data.admins?.find((a: any) => a.username === username);

    if (!admin) {
      return res.status(404).json({ error: 'Username not found' });
    }

    data.admins = data.admins.map((a: any) =>
      a.username === username
        ? { ...a, passwordHash: hashPassword(newPassword), emergencyResetAt: new Date().toISOString() }
        : a
    );
    writeData(data);

    return res.status(200).json({ success: true, message: 'Password reset via emergency key!' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
