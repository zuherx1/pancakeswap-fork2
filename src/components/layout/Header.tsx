import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PancakeLogo } from '../ui/Icons';
import { Button } from '../ui/Button';
import { useThemeContext } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useWeb3 } from '../../context/Web3Context';
import { getChainById } from '../../config/supportedChains';
import WalletModal from '../wallet/WalletModal';
import NetworkSwitcherModal from './NetworkSwitcherModal';
import GlobalSettingsModal from './GlobalSettingsModal';

const NAV_ITEMS = [
  { label:'Trade', icon:'💱', children:[
    { label:'Swap',       href:'/trade/swap',       icon:'🔄' },
    { label:'Buy Crypto', href:'/trade/buy-crypto', icon:'💳' },
    { label:'Liquidity',  href:'/trade/liquidity',  icon:'💧' },
  ]},
  { label:'Perps', icon:'📈', href:'/perps' },
  { label:'Earn',  icon:'💰', children:[
    { label:'Farm',  href:'/earn/farms', icon:'🌾' },
    { label:'Pools', href:'/earn/pools', icon:'🏊' },
  ]},
  { label:'Play', icon:'🎮', children:[
    { label:'Springboard', href:'/play/springboard', icon:'🚀' },
    { label:'Prediction',  href:'/play/prediction',  icon:'🔮' },
    { label:'Lottery',     href:'/play/lottery',     icon:'🎰' },
    { label:'CakePad',     href:'/play/cakepad',     icon:'🎂' },
  ]},
  { label:'Board', icon:'📊', children:[
    { label:'Info',   href:'/board/info',   icon:'📉' },
    { label:'Burn',   href:'/board/burn',   icon:'🔥' },
    { label:'Voting', href:'/board/voting', icon:'🗳️' },
    { label:'Blog',   href:'/board/blog',   icon:'📝' },
  ]},
];

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Outer = styled.header`
  position:sticky; top:0;
  z-index:${({theme})=>theme.zIndices.sticky}; width:100%;
`;
const Inner = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  background:${({theme})=>theme.colors.backgroundAlt};
  border-bottom:1px solid ${({theme})=>theme.colors.cardBorder};
  height:56px; padding:0 16px; backdrop-filter:blur(8px);
`;
const LogoArea = styled.div`display:flex; align-items:center; gap:10px; cursor:pointer;`;
const LogoText = styled.span`
  font-size:20px; font-weight:700; color:${({theme})=>theme.colors.text};
  font-family:'Kanit',sans-serif;
  @media(max-width:768px){display:none;}
`;
const NavList = styled.nav`
  display:flex; align-items:center; gap:2px;
  @media(max-width:968px){display:none;}
`;
const NavItem = styled.div`position:relative;`;
const NavBtn = styled.button<{active?:boolean}>`
  display:flex; align-items:center; gap:6px;
  padding:8px 12px; border-radius:12px;
  background:${({active,theme})=>active?theme.colors.input:'transparent'};
  color:${({active,theme})=>active?theme.colors.primary:theme.colors.textSubtle};
  font-size:15px; font-weight:600; font-family:'Kanit',sans-serif;
  cursor:pointer; border:none; transition:all 0.15s; white-space:nowrap;
  &:hover{background:${({theme})=>theme.colors.input};color:${({theme})=>theme.colors.text};}
  svg{transition:transform 0.2s;}
  &[data-open="true"] svg{transform:rotate(180deg);}
`;
const Dropdown = styled.div<{open:boolean}>`
  position:absolute; top:calc(100% + 8px); left:0; min-width:200px;
  background:${({theme})=>theme.colors.backgroundAlt};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  border-radius:16px; padding:8px;
  box-shadow:0 4px 24px rgba(0,0,0,0.12);
  z-index:100; display:${({open})=>open?'block':'none'};
  animation:slideDown 0.15s ease;
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
`;
const DLink = styled.a<{active?:boolean}>`
  display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
  color:${({active,theme})=>active?theme.colors.primary:theme.colors.text};
  font-size:15px; font-weight:${({active})=>active?600:400};
  text-decoration:none; transition:background 0.15s;
  background:${({active,theme})=>active?theme.colors.input:'transparent'};
  &:hover{background:${({theme})=>theme.colors.input};color:${({theme})=>theme.colors.primary};text-decoration:none;}
  span.icon{font-size:18px;}
`;
const Right = styled.div`display:flex; align-items:center; gap:6px;`;
const NetBtn = styled.button<{$color:string}>`
  display:flex; align-items:center; gap:7px;
  padding:6px 12px; border-radius:12px;
  background:${({theme})=>theme.colors.input};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  font-size:13px; font-weight:700; font-family:'Kanit',sans-serif;
  color:${({theme})=>theme.colors.text}; cursor:pointer; transition:all 0.15s; white-space:nowrap;
  &:hover{border-color:${({$color})=>$color};background:${({$color})=>$color+'12'};}
  @media(max-width:640px){display:none;}
`;
const Dot = styled.div<{$color:string}>`
  width:8px; height:8px; border-radius:50%;
  background:${({$color})=>$color}; box-shadow:0 0 6px ${({$color})=>$color}; flex-shrink:0;
`;
const IconBtn = styled.button`
  width:36px; height:36px; border-radius:50%; border:none;
  background:${({theme})=>theme.colors.input}; color:${({theme})=>theme.colors.textSubtle};
  font-size:18px; display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all 0.2s;
  &:hover{background:${({theme})=>theme.colors.inputSecondary};color:${({theme})=>theme.colors.text};transform:rotate(25deg);}
`;
const ThemBtn = styled(IconBtn)`&:hover{transform:none;}`;
const HamBtn = styled.button`
  display:none; width:36px; height:36px; border-radius:8px; border:none;
  background:${({theme})=>theme.colors.input}; color:${({theme})=>theme.colors.text};
  font-size:20px; align-items:center; justify-content:center; cursor:pointer;
  @media(max-width:968px){display:flex;}
`;

/* Mobile drawer */
const Drawer = styled.div<{open:boolean}>`
  position:fixed; inset:0; z-index:${({theme})=>theme.zIndices.fixed};
  display:${({open})=>open?'flex':'none'};
`;
const Overlay = styled.div`position:absolute; inset:0; background:rgba(0,0,0,0.5);`;
const Panel = styled.div`
  position:relative; width:280px; height:100%;
  background:${({theme})=>theme.colors.backgroundAlt};
  border-right:1px solid ${({theme})=>theme.colors.cardBorder};
  overflow-y:auto; padding:24px 16px; z-index:1;
`;
const MSection = styled.div`margin-bottom:8px;`;
const MGroup = styled.div`
  font-size:12px; font-weight:700; text-transform:uppercase;
  letter-spacing:0.08em; color:${({theme})=>theme.colors.textSubtle};
  padding:8px 12px 4px;
`;
const MLink = styled.a<{active?:boolean}>`
  display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px;
  color:${({active,theme})=>active?theme.colors.primary:theme.colors.text};
  font-size:16px; font-weight:${({active})=>active?600:400};
  text-decoration:none;
  background:${({active,theme})=>active?theme.colors.input:'transparent'};
  transition:background 0.15s;
  &:hover{background:${({theme})=>theme.colors.input};text-decoration:none;}
`;

/* ─── Component ─────────────────────────────────────────────────────────── */
const Header: React.FC = () => {
  const router = useRouter();
  const { isDark, toggleTheme } = useThemeContext();
  const { settings }            = useSettings();
  const { account }             = useWeb3();

  const [openDrop,     setOpenDrop]     = useState<string|null>(null);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [walletOpen,   setWalletOpen]   = useState(false);
  const [networkOpen,  setNetworkOpen]  = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const chain = getChainById(settings.activeChainId);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenDrop(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [router.pathname]);

  const active = (href?: string, children?: any[]) => {
    if (href)     return router.pathname === href || router.pathname.startsWith(href);
    if (children) return children.some(c => router.pathname.startsWith(c.href));
    return false;
  };

  const addr = (a: string) => `${a.slice(0,6)}…${a.slice(-4)}`;

  return (
    <>
      <Outer>
        <Inner>
          <Link href="/" style={{textDecoration:'none'}}>
            <LogoArea><PancakeLogo size={36}/><LogoText>PancakeSwap</LogoText></LogoArea>
          </Link>

          <NavList ref={ref}>
            {NAV_ITEMS.map(item => (
              <NavItem key={item.label}>
                {(item as any).href ? (
                  <Link href={(item as any).href} style={{textDecoration:'none'}}>
                    <NavBtn active={active((item as any).href)}>{item.icon} {item.label}</NavBtn>
                  </Link>
                ) : (
                  <>
                    <NavBtn
                      active={active(undefined,(item as any).children)}
                      data-open={openDrop===item.label?'true':'false'}
                      onClick={()=>setOpenDrop(openDrop===item.label?null:item.label)}
                    >
                      {item.icon} {item.label}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </NavBtn>
                    <Dropdown open={openDrop===item.label}>
                      {(item as any).children?.map((c: any) => (
                        <Link key={c.href} href={c.href} style={{textDecoration:'none'}}>
                          <DLink active={router.pathname===c.href} onClick={()=>setOpenDrop(null)}>
                            <span className="icon">{c.icon}</span>{c.label}
                          </DLink>
                        </Link>
                      ))}
                    </Dropdown>
                  </>
                )}
              </NavItem>
            ))}
          </NavList>

          <Right>
            {/* Chain switcher */}
            <NetBtn $color={chain.color} onClick={()=>setNetworkOpen(true)}>
              <Dot $color={chain.color}/>
              {chain.icon} {chain.shortName}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 3.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NetBtn>

            {/* Settings */}
            <IconBtn onClick={()=>setSettingsOpen(true)} title="Settings">⚙️</IconBtn>

            {/* Theme */}
            <ThemBtn onClick={toggleTheme} title="Toggle theme">{isDark?'☀️':'🌙'}</ThemBtn>

            {/* Wallet */}
            {account
              ? <Button scale="sm" variant="subtle" onClick={()=>setWalletOpen(true)}>🟢 {addr(account)}</Button>
              : <Button scale="sm" onClick={()=>setWalletOpen(true)}>🔓 Connect</Button>
            }

            <HamBtn onClick={()=>setMobileOpen(true)}>☰</HamBtn>
          </Right>
        </Inner>
      </Outer>

      {/* Mobile drawer */}
      <Drawer open={mobileOpen}>
        <Overlay onClick={()=>setMobileOpen(false)}/>
        <Panel>
          <LogoArea style={{marginBottom:20}}>
            <PancakeLogo size={32}/><LogoText style={{display:'block'}}>PancakeSwap</LogoText>
          </LogoArea>

          <NetBtn $color={chain.color} onClick={()=>{setNetworkOpen(true);setMobileOpen(false);}}
            style={{width:'100%',marginBottom:12,justifyContent:'center'}}>
            <Dot $color={chain.color}/>{chain.icon} {chain.name}
          </NetBtn>

          {NAV_ITEMS.map(item=>(
            <MSection key={item.label}>
              <MGroup>{item.icon} {item.label}</MGroup>
              {(item as any).href?(
                <Link href={(item as any).href} style={{textDecoration:'none'}}>
                  <MLink active={active((item as any).href)}>{item.label}</MLink>
                </Link>
              ):(item as any).children?.map((c:any)=>(
                <Link key={c.href} href={c.href} style={{textDecoration:'none'}}>
                  <MLink active={router.pathname===c.href}>{c.icon} {c.label}</MLink>
                </Link>
              ))}
            </MSection>
          ))}

          <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:8}}>
            <Button fullWidth onClick={()=>{setWalletOpen(true);setMobileOpen(false);}}>
              {account?`🟢 ${addr(account)}`:'🔓 Connect Wallet'}
            </Button>
            <Button fullWidth variant="tertiary" onClick={()=>{setSettingsOpen(true);setMobileOpen(false);}}>
              ⚙️ Settings
            </Button>
          </div>
        </Panel>
      </Drawer>

      {walletOpen   && <WalletModal          onDismiss={()=>setWalletOpen(false)}  />}
      {networkOpen  && <NetworkSwitcherModal onDismiss={()=>setNetworkOpen(false)} />}
      {settingsOpen && <GlobalSettingsModal  onDismiss={()=>setSettingsOpen(false)}/>}
    </>
  );
};

export default Header;
