import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Select, SaveBtn, SecondaryBtn,
  DangerBtn, Badge, PageDesc, Divider,
  Toggle, ToggleRow, ToggleInfo, ToggleLabel, ToggleDesc,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';
import { TATUM_CHAINS } from '../../utils/tatum';

export default function TatumPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();
  const [apiKey,     setApiKey]     = useState('');
  const [testnet,    setTestnet]    = useState(false);
  const [verified,   setVerified]   = useState<boolean|null>(null);
  const [saving,     setSaving]     = useState(false);
  const [checking,   setChecking]   = useState(false);
  const [wallets,    setWallets]    = useState<any[]>([]);
  const [genChain,   setGenChain]   = useState('BSC');
  const [genning,    setGenning]    = useState(false);
  const [balLoading, setBalLoading] = useState<string|null>(null);
  const [copied,     setCopied]     = useState<string|null>(null);

  useEffect(() => {
    fetch('/api/admin/data?section=tatumSettings')
      .then(r => r.json())
      .then(d => { if (d?.apiKey) { setApiKey(d.apiKey); setTestnet(d.testnet||false); } })
      .catch(()=>{});
    loadWallets();
  }, []);

  const loadWallets = async () => {
    if (!token) return;
    try {
      const res = await adminFetch('/api/tatum?action=wallets', token);
      if (res.ok) setWallets(await res.json());
    } catch {}
  };

  const handleSaveKey = async () => {
    if (!token||!apiKey) { showToast('Please enter an API key','error'); return; }
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({ section:'tatumSettings', payload:{ apiKey, testnet } }),
      });
      if (res.ok) showToast('Tatum API key saved!');
      else showToast('Failed to save','error');
    } catch { showToast('Network error','error'); }
    finally { setSaving(false); }
  };

  const handleVerify = async () => {
    if (!apiKey) { showToast('Enter API key first','error'); return; }
    await handleSaveKey();
    setChecking(true);
    try {
      const res  = await adminFetch('/api/tatum?action=verify', token!);
      const data = await res.json();
      setVerified(data.valid);
      showToast(data.valid ? 'API key verified!' : 'Invalid API key', data.valid ? 'success' : 'error');
    } catch { setVerified(false); showToast('Verification failed','error'); }
    finally { setChecking(false); }
  };

  const handleGenerate = async () => {
    if (!token) return;
    setGenning(true);
    try {
      const res  = await adminFetch('/api/tatum?action=generate-wallet', token, {
        method: 'POST',
        body: JSON.stringify({ chain: genChain }),
      });
      const data = await res.json();
      if (res.ok) { showToast(`${genChain} wallet created!`); loadWallets(); }
      else showToast(data.error||'Failed to generate wallet','error');
    } catch { showToast('Network error','error'); }
    finally { setGenning(false); }
  };

  const handleRefreshBalance = async (walletId: string) => {
    if (!token) return;
    setBalLoading(walletId);
    try {
      const res  = await adminFetch(`/api/tatum?action=balance&walletId=${walletId}`, token);
      const data = await res.json();
      if (res.ok) {
        setWallets(ws => ws.map(w => w.id===walletId ? {...w,balance:data.balance} : w));
        showToast('Balance refreshed');
      } else showToast(data.error||'Failed','error');
    } catch { showToast('Network error','error'); }
    finally { setBalLoading(null); }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Delete this exchange wallet? This cannot be undone.')) return;
    try {
      const res = await adminFetch(`/api/tatum?action=delete-wallet&walletId=${walletId}`, token!, { method:'DELETE' });
      if (res.ok) { showToast('Wallet deleted'); loadWallets(); }
      else showToast('Failed to delete','error');
    } catch { showToast('Network error','error'); }
  };

  const copyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address).then(()=>{ setCopied(id); setTimeout(()=>setCopied(null),1800); });
  };

  const chainList = Object.entries(TATUM_CHAINS);

  return (
    <AdminLayout title="Tatum.io Integration">
      <PageDesc>
        Connect your Tatum.io account to create exchange wallets and execute on-chain transactions.{' '}
        <a href="https://dashboard.tatum.io" target="_blank" rel="noreferrer" style={{color:'#1FC7D4'}}>
          Get your free API key →
        </a>
      </PageDesc>

      {/* API Key */}
      <Section>
        <SectionTitle>🔑 API Key</SectionTitle>

        <FormRow>
          <Label>Tatum API Key</Label>
          <div style={{display:'flex',gap:10}}>
            <Input
              type="password"
              placeholder="ta_live_xxxxx…"
              value={apiKey}
              onChange={e=>{ setApiKey(e.target.value); setVerified(null); }}
              style={{flex:1}}
            />
            {verified !== null && (
              <div style={{
                display:'flex',alignItems:'center',padding:'0 14px',borderRadius:12,flexShrink:0,
                fontSize:13,fontWeight:700,
                background: verified?'rgba(49,208,170,0.15)':'rgba(237,75,158,0.15)',
                color: verified?'#31D0AA':'#ED4B9E',
                border:`1px solid ${verified?'rgba(49,208,170,0.3)':'rgba(237,75,158,0.3)'}`,
              }}>
                {verified ? '✓ Valid' : '✗ Invalid'}
              </div>
            )}
          </div>
          <Hint>Stored securely on your server. Never exposed to the browser.</Hint>
        </FormRow>

        <ToggleRow>
          <ToggleInfo>
            <ToggleLabel>Testnet Mode</ToggleLabel>
            <ToggleDesc>Use testnet chains for development. Disable for production.</ToggleDesc>
          </ToggleInfo>
          <Toggle value={testnet} onChange={setTestnet} />
        </ToggleRow>

        <div style={{display:'flex',gap:12,marginTop:20}}>
          <SaveBtn $loading={saving} onClick={handleSaveKey}>
            {saving ? 'Saving…' : '💾 Save API Key'}
          </SaveBtn>
          <SecondaryBtn onClick={handleVerify}>
            {checking ? '⏳ Checking…' : '🔍 Verify Key'}
          </SecondaryBtn>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <SectionTitle>⚙️ How Exchange Wallets Work</SectionTitle>
        {[
          { n:'1', t:'Generate wallet',   d:'Create a dedicated wallet for each coin/token on any chain via Tatum.io.' },
          { n:'2', t:'Add liquidity',     d:'Send crypto to the wallet address to fund it. Admin can track liquidity records.' },
          { n:'3', t:'User initiates swap', d:'User sends Token A to your exchange wallet A.' },
          { n:'4', t:'Exchange executes', d:'System sends Token B from exchange wallet B to the user\'s address.' },
          { n:'5', t:'Fees collected',    d:'Configured fee % is deducted and sent to your fee wallet automatically.' },
        ].map(s=>(
          <div key={s.n} style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
            <div style={{
              width:28,height:28,borderRadius:'50%',flexShrink:0,
              background:'linear-gradient(135deg,#1FC7D4,#7645D9)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:13,fontWeight:700,color:'white',
            }}>{s.n}</div>
            <div>
              <div style={{fontWeight:700,color:'white',fontFamily:'Kanit,sans-serif',marginBottom:3}}>{s.t}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.5}}>{s.d}</div>
            </div>
          </div>
        ))}
      </Section>

      {/* Generate Wallet */}
      <Section>
        <SectionTitle>➕ Generate Exchange Wallet</SectionTitle>
        <SectionDesc>Creates a new wallet address on the selected chain. You can have multiple wallets per chain.</SectionDesc>

        <FormGrid cols={2}>
          <FormRow>
            <Label>Select Blockchain</Label>
            <Select value={genChain} onChange={e=>setGenChain(e.target.value)}>
              {chainList.map(([key,chain])=>(
                <option key={key} value={key}>{chain.icon} {chain.name} ({chain.symbol})</option>
              ))}
            </Select>
          </FormRow>
          <div style={{display:'flex',alignItems:'flex-end'}}>
            <SaveBtn $loading={genning} onClick={handleGenerate} style={{width:'100%'}}>
              {genning ? '⏳ Generating…' : '🔑 Generate Wallet'}
            </SaveBtn>
          </div>
        </FormGrid>

        {!apiKey && (
          <div style={{
            padding:'12px 16px',borderRadius:12,marginTop:8,
            background:'rgba(255,178,55,0.1)',border:'1px solid rgba(255,178,55,0.3)',
            color:'#FFB237',fontSize:13,
          }}>
            ⚠️ Add and verify your Tatum API key above before generating wallets.
          </div>
        )}
      </Section>

      {/* Wallets List */}
      <Section>
        <SectionTitle>
          👛 Exchange Wallets <Badge $color="#1FC7D4">{wallets.length}</Badge>
        </SectionTitle>

        {wallets.length === 0 && (
          <div style={{textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)',fontSize:15}}>
            No exchange wallets yet. Generate your first wallet above.
          </div>
        )}

        {wallets.map(wallet=>{
          const chainInfo = TATUM_CHAINS[wallet.chain];
          return (
            <div key={wallet.id} style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:16,padding:'18px 20px',marginBottom:12,
            }}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <span style={{fontSize:26}}>{chainInfo?.icon||'🔗'}</span>
                    <div>
                      <div style={{fontWeight:700,color:'white',fontFamily:'Kanit,sans-serif'}}>
                        {chainInfo?.name||wallet.chain}
                      </div>
                      <Badge $color="#7645D9">{wallet.chain}</Badge>
                      {wallet.tokenId && <Badge $color="#FFB237" style={{marginLeft:6}}>Token Wallet</Badge>}
                    </div>
                  </div>

                  <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:5}}>Address:</div>
                  <div
                    onClick={()=>copyAddress(wallet.id, wallet.address)}
                    style={{
                      fontFamily:'monospace',fontSize:12,color:'#1FC7D4',
                      wordBreak:'break-all',marginBottom:10,
                      background:'rgba(31,199,212,0.08)',padding:'10px 12px',borderRadius:10,
                      cursor:'pointer',lineHeight:1.6,
                      border:'1px solid rgba(31,199,212,0.15)',
                    }}
                  >
                    {wallet.address}
                    <span style={{marginLeft:8,fontSize:11,opacity:0.6}}>
                      {copied===wallet.id ? '✓ Copied!' : '📋 Click to copy'}
                    </span>
                  </div>

                  <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',fontSize:13}}>
                    <div>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>Balance: </span>
                      <span style={{fontWeight:700,color:'#31D0AA'}}>
                        {wallet.balance||'0'} {chainInfo?.symbol||''}
                      </span>
                    </div>
                    <div style={{color:'rgba(255,255,255,0.3)',fontSize:12}}>
                      Created {new Date(wallet.createdAt).toLocaleDateString()}
                    </div>
                    {wallet.liquidityHistory?.length>0 && (
                      <Badge $color="#FFB237">{wallet.liquidityHistory.length} liquidity records</Badge>
                    )}
                  </div>
                </div>

                <div style={{display:'flex',gap:8,flexDirection:'column',flexShrink:0}}>
                  <SecondaryBtn
                    onClick={()=>handleRefreshBalance(wallet.id)}
                    style={{padding:'8px 14px',fontSize:13}}
                  >
                    {balLoading===wallet.id ? '⏳' : '🔄'} Balance
                  </SecondaryBtn>
                  <DangerBtn
                    onClick={()=>handleDeleteWallet(wallet.id)}
                    style={{padding:'8px 14px',fontSize:13}}
                  >
                    🗑️ Delete
                  </DangerBtn>
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      {ToastComponent}
    </AdminLayout>
  );
}
