import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const fadeUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0D0B1E 0%, #1a1139 50%, #08060B 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
`;

const Card = styled.div`
  background: rgba(26,23,32,0.95);
  border: 1px solid rgba(118,69,217,0.3);
  border-radius: 28px;
  padding: 44px 40px;
  width: 100%; max-width: 520px;
  animation: ${fadeUp} 0.4s ease;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
`;

const StepBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 14px; border-radius: 20px; margin-bottom: 24px;
  background: rgba(31,199,212,0.12);
  border: 1px solid rgba(31,199,212,0.25);
  color: #1FC7D4; font-size: 13px; font-weight: 700;
  font-family: 'Kanit', sans-serif;
`;

const Steps = styled.div`
  display: flex; gap: 0; margin-bottom: 32px;
`;

const StepDot = styled.div<{ $done: boolean; $active: boolean }>`
  flex: 1; height: 4px; border-radius: 2px;
  background: ${({ $done, $active }) =>
    $done   ? '#1FC7D4' :
    $active ? 'linear-gradient(90deg, #1FC7D4, #7645D9)' :
    'rgba(255,255,255,0.1)'};
  margin: 0 2px; transition: background 0.3s;
`;

const Logo = styled.div`
  text-align: center; margin-bottom: 28px;
  .emoji { font-size: 52px; display: block; margin-bottom: 10px; }
  h1 { font-size: 26px; font-weight: 700; color: white; font-family: 'Kanit',sans-serif; margin: 0 0 6px; }
  p  { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; }
`;

const SectionTitle = styled.h2`
  font-size: 20px; font-weight: 700; color: white;
  font-family: 'Kanit',sans-serif; margin: 0 0 6px;
`;

const SectionDesc = styled.p`
  font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 24px; line-height: 1.6;
`;

const Label = styled.label`
  display: block; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.7); margin-bottom: 7px;
  font-family: 'Kanit', sans-serif;
`;

const Hint = styled.p`font-size: 11px; color: rgba(255,255,255,0.35); margin: 5px 0 0;`;

const Input = styled.input`
  width: 100%; padding: 13px 16px; margin-bottom: 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px; color: white;
  font-size: 15px; font-family: 'Kanit',sans-serif;
  outline: none; transition: border-color 0.2s; box-sizing: border-box;
  &:focus { border-color: #1FC7D4; }
  &::placeholder { color: rgba(255,255,255,0.28); }
`;

const PasswordWrap = styled.div`position: relative; margin-bottom: 16px;`;

const PasswordInput = styled(Input)`margin-bottom: 0; padding-right: 48px;`;

const ShowBtn = styled.button`
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.4); font-size: 18px;
  &:hover { color: rgba(255,255,255,0.7); }
`;

const PrimaryBtn = styled.button<{ $loading?: boolean }>`
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #1FC7D4, #7645D9);
  border: none; border-radius: 14px;
  color: white; font-size: 16px; font-weight: 700;
  font-family: 'Kanit',sans-serif; cursor: pointer;
  transition: all 0.2s; margin-top: 8px;
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  &:hover { transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-2px)'}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const SecBtn = styled.button`
  width: 100%; padding: 13px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px; color: rgba(255,255,255,0.7);
  font-size: 15px; font-weight: 600; font-family: 'Kanit',sans-serif;
  cursor: pointer; transition: all 0.15s; margin-top: 10px;
  &:hover { background: rgba(255,255,255,0.1); color: white; }
`;

const ErrorBox = styled.div`
  background: rgba(237,75,158,0.12);
  border: 1px solid rgba(237,75,158,0.35);
  border-radius: 12px; padding: 11px 16px;
  color: #ED4B9E; font-size: 13px; margin-bottom: 16px;
`;

const SuccessBox = styled.div`
  background: rgba(49,208,170,0.12);
  border: 1px solid rgba(49,208,170,0.35);
  border-radius: 12px; padding: 11px 16px;
  color: #31D0AA; font-size: 13px; margin-bottom: 16px;
  line-height: 1.6;
`;

const StrengthBar = styled.div`
  display: flex; gap: 4px; margin: 6px 0 14px;
`;

const StrengthSeg = styled.div<{ $filled: boolean; $color: string }>`
  flex: 1; height: 4px; border-radius: 2px;
  background: ${({ $filled, $color }) => $filled ? $color : 'rgba(255,255,255,0.1)'};
  transition: background 0.2s;
`;

const StrengthLabel = styled.div`font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px;`;

const CheckRow = styled.div<{ $ok: boolean }>`
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; margin-bottom: 5px;
  color: ${({ $ok }) => $ok ? '#31D0AA' : 'rgba(255,255,255,0.35)'};
  transition: color 0.2s;
`;

const AlreadyDone = styled.div`
  text-align: center; padding: 32px 0;
`;

/* ─── Password strength ──────────────────────────────────────────────────── */
function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8)    score++;
  if (pw.length >= 12)   score++;
  if (/[A-Z]/.test(pw))  score++;
  if (/[0-9]/.test(pw))  score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_COLORS = ['#ED4B9E','#FFB237','#FFB237','#1FC7D4','#31D0AA'];
const STRENGTH_LABELS = ['Too weak','Weak','Fair','Good','Strong'];

/* ─── Component ─────────────────────────────────────────────────────────── */
type SetupStep = 'welcome' | 'account' | 'site' | 'done';

export default function SetupPage() {
  const router = useRouter();

  const [step,          setStep]         = useState<SetupStep>('welcome');
  const [checking,      setChecking]     = useState(true);
  const [alreadyDone,   setAlreadyDone]  = useState(false);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState('');
  const [showPass,      setShowPass]     = useState(false);
  const [showConfirm,   setShowConfirm]  = useState(false);

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [email,     setEmail]     = useState('');
  const [siteName,  setSiteName]  = useState('');

  // Check if setup already done
  useEffect(() => {
    fetch('/api/admin/setup?action=check')
      .then(r => r.json())
      .then(d => {
        setChecking(false);
        if (!d.needsSetup) setAlreadyDone(true);
      })
      .catch(() => setChecking(false));
  }, []);

  const strength    = getStrength(password);
  const passMatch   = password && confirm && password === confirm;
  const passNoMatch = confirm && password !== confirm;

  const checks = [
    { label: 'At least 8 characters',   ok: password.length >= 8 },
    { label: 'Contains a number',        ok: /[0-9]/.test(password) },
    { label: 'Contains uppercase',       ok: /[A-Z]/.test(password) },
    { label: 'Passwords match',          ok: !!passMatch },
  ];

  const handleSetup = async () => {
    if (!username.trim()) { setError('Please enter a username'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/setup?action=setup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim(), password, email: email.trim(), siteName: siteName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('done');
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  if (alreadyDone) {
    return (
      <Page>
        <Card>
          <Logo>
            <span className="emoji">🔒</span>
            <h1>Already Set Up</h1>
          </Logo>
          <AlreadyDone>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
              Your exchange has already been configured.<br/>
              Please log in with your admin credentials.
            </div>
            <PrimaryBtn onClick={() => router.push('/admin')}>
              Go to Admin Login →
            </PrimaryBtn>
          </AlreadyDone>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        {/* Progress bar */}
        <Steps>
          {(['welcome','account','site','done'] as SetupStep[]).map((s, i) => (
            <StepDot
              key={s}
              $done={(['welcome','account','site','done'] as SetupStep[]).indexOf(step) > i}
              $active={step === s}
            />
          ))}
        </Steps>

        {/* ── Welcome step ── */}
        {step === 'welcome' && (
          <>
            <Logo>
              <span className="emoji">🥞</span>
              <h1>Welcome to Your Exchange</h1>
              <p>Let's set up your admin account in 2 quick steps</p>
            </Logo>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {[
                { icon: '🔐', title: 'Create admin account',    desc: 'Set your username and a strong password' },
                { icon: '🎨', title: 'Name your exchange',      desc: 'Give your DEX a custom name' },
                { icon: '✅', title: 'Done — start managing!',  desc: 'Access your full admin dashboard' },
              ].map(item => (
                <div key={item.title} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <PrimaryBtn onClick={() => setStep('account')}>
              Start Setup →
            </PrimaryBtn>
          </>
        )}

        {/* ── Account step ── */}
        {step === 'account' && (
          <>
            <StepBadge>Step 1 of 2</StepBadge>
            <SectionTitle>🔐 Create Admin Account</SectionTitle>
            <SectionDesc>This is the account you'll use to log in to your admin panel at yourdomain.com/admin</SectionDesc>

            {error && <ErrorBox>⚠️ {error}</ErrorBox>}

            <Label>Username *</Label>
            <Input
              placeholder="e.g. admin"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoFocus
            />

            <Label>Email (optional)</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Hint style={{ marginTop: -10, marginBottom: 16 }}>Used for account identification only — no emails are sent</Hint>

            <Label>Password *</Label>
            <PasswordWrap>
              <PasswordInput
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              <ShowBtn type="button" onClick={() => setShowPass(v => !v)}>
                {showPass ? '🙈' : '👁️'}
              </ShowBtn>
            </PasswordWrap>

            {password && (
              <>
                <StrengthBar>
                  {[0,1,2,3,4].map(i => (
                    <StrengthSeg key={i} $filled={strength > i} $color={STRENGTH_COLORS[strength - 1] || '#ED4B9E'} />
                  ))}
                </StrengthBar>
                <StrengthLabel>{password ? STRENGTH_LABELS[strength - 1] || 'Too weak' : ''}</StrengthLabel>
              </>
            )}

            <Label>Confirm Password *</Label>
            <PasswordWrap>
              <PasswordInput
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                style={{ borderColor: passNoMatch ? '#ED4B9E' : confirm && passMatch ? '#31D0AA' : undefined }}
              />
              <ShowBtn type="button" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? '🙈' : '👁️'}
              </ShowBtn>
            </PasswordWrap>

            {password && (
              <div style={{ marginBottom: 16 }}>
                {checks.map(c => (
                  <CheckRow key={c.label} $ok={c.ok}>
                    <span style={{ fontSize: 14 }}>{c.ok ? '✓' : '○'}</span>
                    {c.label}
                  </CheckRow>
                ))}
              </div>
            )}

            <PrimaryBtn
              $loading={false}
              disabled={!username || password.length < 8 || password !== confirm}
              onClick={() => { setError(''); setStep('site'); }}
            >
              Next →
            </PrimaryBtn>
            <SecBtn onClick={() => setStep('welcome')}>← Back</SecBtn>
          </>
        )}

        {/* ── Site step ── */}
        {step === 'site' && (
          <>
            <StepBadge>Step 2 of 2</StepBadge>
            <SectionTitle>🎨 Name Your Exchange</SectionTitle>
            <SectionDesc>Give your DEX a name. You can always change this later from Admin → Site Settings.</SectionDesc>

            {error && <ErrorBox>⚠️ {error}</ErrorBox>}

            <Label>Exchange Name</Label>
            <Input
              placeholder="e.g. MySwap, CryptoX, TokenHub…"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              autoFocus
            />
            <Hint style={{ marginTop: -10, marginBottom: 24 }}>Shown in the header and browser tab</Hint>

            {/* Summary */}
            <div style={{
              padding: '16px 18px', borderRadius: 16, marginBottom: 24,
              background: 'rgba(31,199,212,0.08)', border: '1px solid rgba(31,199,212,0.2)',
            }}>
              <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 10 }}>
                📋 Summary
              </div>
              {[
                { label: 'Username',       val: username },
                { label: 'Email',          val: email || '(not set)' },
                { label: 'Exchange name',  val: siteName || 'PancakeSwap (default)' },
                { label: 'Admin URL',      val: 'yourdomain.com/admin' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{r.label}</span>
                  <span style={{ color: 'white', fontWeight: 600, fontFamily: 'Kanit,sans-serif' }}>{r.val}</span>
                </div>
              ))}
            </div>

            <PrimaryBtn $loading={loading} onClick={handleSetup}>
              {loading ? 'Setting up…' : '🚀 Complete Setup'}
            </PrimaryBtn>
            <SecBtn onClick={() => setStep('account')}>← Back</SecBtn>
          </>
        )}

        {/* ── Done step ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <SectionTitle style={{ textAlign: 'center', marginBottom: 10 }}>Setup Complete!</SectionTitle>
            <SectionDesc style={{ textAlign: 'center', marginBottom: 28 }}>
              Your exchange is ready. Log in with your new credentials to start managing it.
            </SectionDesc>

            <SuccessBox>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>✅ Your admin account is ready</div>
              <div>Username: <strong>{username}</strong></div>
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                Admin panel: <strong>yourdomain.com/admin</strong>
              </div>
            </SuccessBox>

            <PrimaryBtn onClick={() => router.push('/admin')}>
              🔐 Go to Admin Login →
            </PrimaryBtn>
          </div>
        )}
      </Card>
    </Page>
  );
}
