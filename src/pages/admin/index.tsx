import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';
import { useAdmin } from '../../context/AdminContext';

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0D0B1E 0%, #1a1139 50%, #08060B 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
`;

const Card = styled.div`
  background: rgba(26,23,32,0.97);
  border: 1px solid rgba(118,69,217,0.3);
  border-radius: 26px;
  padding: 40px 36px;
  width: 100%; max-width: 420px;
  animation: ${fadeIn} 0.4s ease;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
`;

const Logo = styled.div`
  text-align: center; margin-bottom: 28px;
  .emoji { font-size: 46px; display: block; margin-bottom: 8px; }
  h1 { font-size: 22px; font-weight: 700; color: white; font-family:'Kanit',sans-serif; margin:0 0 4px; }
  p  { font-size: 13px; color: rgba(255,255,255,0.45); margin: 0; }
`;

const TabRow = styled.div`
  display: flex;
  background: rgba(255,255,255,0.06);
  border-radius: 14px; padding: 4px; gap: 4px; margin-bottom: 24px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1; padding: 9px 8px; border-radius: 10px;
  font-size: 14px; font-weight: 700; font-family:'Kanit',sans-serif;
  cursor: pointer; border: none; transition: all 0.15s;
  background: ${({ $active }) => $active ? 'rgba(31,199,212,0.2)' : 'transparent'};
  color: ${({ $active }) => $active ? '#1FC7D4' : 'rgba(255,255,255,0.45)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(31,199,212,0.35)' : 'transparent'};
`;

const Label = styled.label`
  display: block; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.7); margin-bottom: 7px;
  font-family:'Kanit',sans-serif;
`;

const InputWrap = styled.div`position: relative; margin-bottom: 16px;`;

const Input = styled.input`
  width: 100%; padding: 13px 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 14px; color: white;
  font-size: 15px; font-family:'Kanit',sans-serif;
  outline: none; transition: border-color 0.2s; box-sizing: border-box;
  &:focus { border-color: #1FC7D4; }
  &::placeholder { color: rgba(255,255,255,0.28); }
`;

const PasswordInput = styled(Input)`padding-right: 48px;`;

const EyeBtn = styled.button`
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.35); font-size: 18px;
  &:hover { color: rgba(255,255,255,0.65); }
`;

const PrimaryBtn = styled.button<{ $loading?: boolean }>`
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #1FC7D4, #7645D9);
  border: none; border-radius: 14px;
  color: white; font-size: 16px; font-weight: 700;
  font-family:'Kanit',sans-serif; cursor: pointer;
  transition: all 0.2s; margin-top: 4px;
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  &:hover { transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-2px)'}; box-shadow: 0 8px 24px rgba(31,199,212,0.3); }
  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
`;

const ErrorMsg = styled.div`
  background: rgba(237,75,158,0.13);
  border: 1px solid rgba(237,75,158,0.38);
  border-radius: 11px; padding: 10px 14px;
  color: #ED4B9E; font-size: 13px; margin-bottom: 14px; text-align: center;
`;

const SuccessMsg = styled.div`
  background: rgba(49,208,170,0.12);
  border: 1px solid rgba(49,208,170,0.35);
  border-radius: 11px; padding: 12px 16px;
  color: #31D0AA; font-size: 13px; margin-bottom: 14px;
  text-align: center; line-height: 1.6;
`;

const FooterRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 18px; flex-wrap: wrap; gap: 8px;
`;

const FooterLink = styled.a`
  font-size: 12px; color: rgba(255,255,255,0.35);
  text-decoration: none; cursor: pointer; font-family:'Kanit',sans-serif;
  &:hover { color: #1FC7D4; text-decoration: underline; }
`;

const Divider = styled.div`
  height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0;
`;

const EmergencySection = styled.div`
  margin-top: 16px;
  padding: 14px 16px;
  background: rgba(255,178,55,0.07);
  border: 1px solid rgba(255,178,55,0.2);
  border-radius: 12px;
`;

const EmergencyTitle = styled.div`
  font-size: 12px; font-weight: 700; color: #FFB237;
  font-family:'Kanit',sans-serif; margin-bottom: 6px;
`;

const StrengthBar = styled.div`display:flex;gap:4px;margin:4px 0 12px;`;
const StrengthSeg = styled.div<{ $on: boolean; $color: string }>`
  flex:1;height:4px;border-radius:2px;
  background:${({ $on, $color }) => $on ? $color : 'rgba(255,255,255,0.1)'};
  transition:background .2s;
`;

function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const S_COLORS = ['#ED4B9E','#FFB237','#FFB237','#1FC7D4','#31D0AA'];

type TabType = 'login' | 'reset';

export default function AdminLoginPage() {
  const router  = useRouter();
  const { login, isLoggedIn, loading: authLoading } = useAdmin();

  const [tab,           setTab]          = useState<TabType>('login');
  const [username,      setUsername]     = useState('');
  const [password,      setPassword]     = useState('');
  const [showPass,      setShowPass]     = useState(false);
  const [error,         setError]        = useState('');
  const [loading,       setLoading]      = useState(false);

  // Reset password state
  const [resetUser,     setResetUser]    = useState('');
  const [resetCurrent,  setResetCurrent] = useState('');
  const [resetNew,      setResetNew]     = useState('');
  const [resetConfirm,  setResetConfirm] = useState('');
  const [showReset,     setShowReset]    = useState(false);
  const [showNewPass,   setShowNewPass]  = useState(false);
  const [resetSuccess,  setResetSuccess] = useState('');

  // Emergency reset state
  const [showEmergency, setShowEmergency]= useState(false);
  const [emergKey,      setEmergKey]     = useState('');
  const [emergUser,     setEmergUser]    = useState('');
  const [emergNew,      setEmergNew]     = useState('');
  const [emergLoading,  setEmergLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isLoggedIn) router.replace('/admin/dashboard');
  }, [isLoggedIn, authLoading, router]);

  // Auto-prefill username on reset tab
  useEffect(() => {
    if (tab === 'reset' && username) setResetUser(username);
  }, [tab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    const result = await login(username, password);
    if (result.success) {
      router.replace('/admin/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setResetSuccess('');
    if (!resetUser || !resetCurrent || !resetNew || !resetConfirm) { setError('All fields are required'); return; }
    if (resetNew.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (resetNew !== resetConfirm) { setError('New passwords do not match'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/admin/setup?action=reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: resetUser, currentPassword: resetCurrent, newPassword: resetNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess('✅ Password updated! You can now log in with your new password.');
        setResetCurrent(''); setResetNew(''); setResetConfirm('');
        setTimeout(() => { setTab('login'); setResetSuccess(''); }, 3000);
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyReset = async () => {
    if (!emergKey || !emergUser || !emergNew) { setError('All fields required'); return; }
    if (emergNew.length < 8) { setError('Password must be at least 8 characters'); return; }
    setEmergLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/setup?action=emergency-reset', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ setupKey: emergKey, username: emergUser, newPassword: emergNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess('✅ Emergency reset done! Log in with your new password.');
        setShowEmergency(false); setEmergKey(''); setEmergNew('');
        setTimeout(() => { setTab('login'); setResetSuccess(''); }, 3000);
      } else {
        setError(data.error || 'Emergency reset failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setEmergLoading(false);
    }
  };

  if (authLoading) return null;

  const newPassStrength = getStrength(resetNew);

  return (
    <Page>
      <Card>
        <Logo>
          <span className="emoji">🥞</span>
          <h1>Admin Panel</h1>
          <p>Manage your exchange</p>
        </Logo>

        {/* Tab switcher */}
        <TabRow>
          <Tab $active={tab === 'login'} onClick={() => { setTab('login'); setError(''); setResetSuccess(''); }}>
            🔐 Sign In
          </Tab>
          <Tab $active={tab === 'reset'} onClick={() => { setTab('reset'); setError(''); setResetSuccess(''); }}>
            🔑 Reset Password
          </Tab>
        </TabRow>

        {/* ── Login tab ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            {error      && <ErrorMsg>{error}</ErrorMsg>}
            {resetSuccess && <SuccessMsg>{resetSuccess}</SuccessMsg>}

            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoFocus
            />

            <Label>Password</Label>
            <InputWrap>
              <PasswordInput
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              <EyeBtn type="button" onClick={() => setShowPass(v => !v)}>
                {showPass ? '🙈' : '👁️'}
              </EyeBtn>
            </InputWrap>

            <PrimaryBtn type="submit" $loading={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </PrimaryBtn>

            <FooterRow>
              <FooterLink onClick={() => router.push('/setup')}>
                First time? Run setup →
              </FooterLink>
              <FooterLink onClick={() => { setTab('reset'); setError(''); }}>
                Forgot password?
              </FooterLink>
            </FooterRow>
          </form>
        )}

        {/* ── Reset Password tab ── */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword}>
            {error        && <ErrorMsg>{error}</ErrorMsg>}
            {resetSuccess && <SuccessMsg>{resetSuccess}</SuccessMsg>}

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 18, lineHeight: 1.6 }}>
              Enter your current password to set a new one. If you forgot your current password, use the Emergency Reset below.
            </div>

            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Your admin username"
              value={resetUser}
              onChange={e => { setResetUser(e.target.value); setError(''); }}
              autoFocus
            />

            <Label>Current Password</Label>
            <InputWrap>
              <PasswordInput
                type={showReset ? 'text' : 'password'}
                placeholder="Your current password"
                value={resetCurrent}
                onChange={e => { setResetCurrent(e.target.value); setError(''); }}
              />
              <EyeBtn type="button" onClick={() => setShowReset(v => !v)}>
                {showReset ? '🙈' : '👁️'}
              </EyeBtn>
            </InputWrap>

            <Divider />

            <Label>New Password</Label>
            <InputWrap>
              <PasswordInput
                type={showNewPass ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={resetNew}
                onChange={e => { setResetNew(e.target.value); setError(''); }}
              />
              <EyeBtn type="button" onClick={() => setShowNewPass(v => !v)}>
                {showNewPass ? '🙈' : '👁️'}
              </EyeBtn>
            </InputWrap>

            {resetNew && (
              <StrengthBar>
                {[0,1,2,3,4].map(i => (
                  <StrengthSeg key={i} $on={newPassStrength > i} $color={S_COLORS[newPassStrength-1]||'#ED4B9E'} />
                ))}
              </StrengthBar>
            )}

            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Repeat new password"
              value={resetConfirm}
              onChange={e => { setResetConfirm(e.target.value); setError(''); }}
              style={{
                borderColor: resetConfirm && resetNew !== resetConfirm
                  ? '#ED4B9E'
                  : resetConfirm && resetNew === resetConfirm
                  ? '#31D0AA'
                  : undefined,
              }}
            />

            <PrimaryBtn
              type="submit"
              $loading={loading}
              disabled={!resetUser || !resetCurrent || resetNew.length < 8 || resetNew !== resetConfirm}
            >
              {loading ? 'Updating…' : '🔑 Update Password'}
            </PrimaryBtn>

            {/* Emergency reset section */}
            <div style={{ marginTop: 20 }}>
              <FooterLink onClick={() => setShowEmergency(v => !v)}>
                🆘 Forgot current password? Emergency reset
              </FooterLink>
            </div>

            {showEmergency && (
              <EmergencySection>
                <EmergencyTitle>🆘 Emergency Reset</EmergencyTitle>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10, lineHeight: 1.5 }}>
                  Add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>SETUP_RESET_KEY=your-secret-key</code> to your <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code> file, then use that key here.
                </div>
                <Input
                  type="password"
                  placeholder="SETUP_RESET_KEY value"
                  value={emergKey}
                  onChange={e => setEmergKey(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Username"
                  value={emergUser}
                  onChange={e => setEmergUser(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={emergNew}
                  onChange={e => setEmergNew(e.target.value)}
                />
                <PrimaryBtn
                  $loading={emergLoading}
                  onClick={handleEmergencyReset}
                  disabled={!emergKey || !emergUser || emergNew.length < 8}
                  style={{ marginTop: 4 }}
                >
                  {emergLoading ? 'Resetting…' : '🆘 Emergency Reset'}
                </PrimaryBtn>
              </EmergencySection>
            )}

            <FooterRow>
              <FooterLink onClick={() => { setTab('login'); setError(''); }}>
                ← Back to Login
              </FooterLink>
            </FooterRow>
          </form>
        )}
      </Card>
    </Page>
  );
}
