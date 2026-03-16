import React from 'react';
import styled from 'styled-components';
import { useInfo } from '../../hooks/useInfo';
import { useThemeContext } from '../../context/ThemeContext';
import LineChart from '../../components/board/LineChart';
import TokenLogo from '../../components/ui/TokenLogo';
import { Text, Heading } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import PageHeader from '../../components/layout/PageHeader';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page = styled.div`min-height:calc(100vh - 56px); background:${({ theme }) => theme.colors.background};`;

const Content = styled.div`max-width:1200px; margin:0 auto; padding:24px 24px 60px;`;

const StatGrid = styled.div`
  display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px;
  @media(max-width:768px){grid-template-columns:1fr 1fr;}
  @media(max-width:480px){grid-template-columns:1fr;}
`;
const StatCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:20px 22px;
`;
const StatLabel = styled.div`font-size:12px; color:${({ theme }) => theme.colors.textSubtle}; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;`;
const StatValue = styled.div`font-size:26px; font-weight:700; color:${({ theme }) => theme.colors.text}; font-family:'Kanit',sans-serif;`;
const StatChange= styled.div<{up:boolean}>`font-size:13px; font-weight:600; color:${({ up,theme }) => up ? theme.colors.success : theme.colors.danger}; margin-top:4px;`;

const ChartGrid = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px;
  @media(max-width:768px){grid-template-columns:1fr;}
`;
const ChartCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; overflow:hidden; padding:16px 16px 8px;
`;
const ChartTitle = styled.div`font-size:14px; font-weight:700; color:${({ theme }) => theme.colors.text}; margin-bottom:12px;`;

const Controls = styled.div`
  display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px;
`;
const TabGroup = styled.div`
  display:flex; background:${({ theme }) => theme.colors.input};
  border-radius:12px; padding:3px; gap:3px;
`;
const TabBtn = styled.button<{active?:boolean}>`
  padding:7px 16px; border-radius:9px;
  font-size:13px; font-weight:600; font-family:'Kanit',sans-serif;
  border:none; cursor:pointer;
  background:${({ active,theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color:${({ active,theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition:all 0.15s;
`;
const SortSelect = styled.select`
  padding:7px 12px; border-radius:12px;
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  color:${({ theme }) => theme.colors.text};
  font-size:13px; font-family:'Kanit',sans-serif; cursor:pointer; outline:none;
`;

const Table = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; overflow:hidden;
`;
const THead = styled.div`
  display:grid; padding:12px 20px;
  background:${({ theme }) => theme.colors.input};
  border-bottom:1px solid ${({ theme }) => theme.colors.cardBorder};
`;
const Th = styled.span`font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${({ theme }) => theme.colors.textSubtle};`;
const TRow = styled.div`
  display:grid; padding:14px 20px; border-bottom:1px solid ${({ theme }) => theme.colors.cardBorder};
  align-items:center; transition:background 0.15s; cursor:pointer;
  &:last-child{border-bottom:none;}
  &:hover{background:${({ theme }) => theme.colors.input};}
`;
const Cell = styled.div`font-size:14px; color:${({ theme }) => theme.colors.text};`;
const ChangeCell = styled.div<{up:boolean}>`font-size:14px; font-weight:600; color:${({ up,theme }) => up ? theme.colors.success : theme.colors.danger};`;

const PairLogos = styled.div`position:relative; width:52px; height:32px; flex-shrink:0;`;
const PairLogo1 = styled.div`position:absolute; left:0; top:0;`;
const PairLogo2 = styled.div`position:absolute; left:22px; top:6px; opacity:0.9;`;

const fmt = (n:number):string => {
  if (n>=1e9) return `$${(n/1e9).toFixed(2)}B`;
  if (n>=1e6) return `$${(n/1e6).toFixed(2)}M`;
  if (n>=1e3) return `$${(n/1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

export default function InfoPage() {
  const { isDark }     = useThemeContext();
  const info           = useInfo();
  const {
    tokens, pairs, tvlHistory, volHistory,
    totalTVL, totalVol24h, totalFees24h, totalTxns,
    tab, setTab, search, setSearch,
    sortTokens, setSortTokens, sortPairs, setSortPairs,
  } = info;

  return (
    <Page>
      <PageHeader
        title="📉 Analytics"
        subtitle="PancakeSwap protocol stats, token info and pair data"
        background="linear-gradient(139.73deg,#E5FDFF 0%,#F3EFFF 100%)"
      />
      <Content>
        {/* Overview stats */}
        <StatGrid>
          <StatCard>
            <StatLabel>Total Value Locked</StatLabel>
            <StatValue style={{ color:'#1FC7D4' }}>{fmt(totalTVL)}</StatValue>
            <StatChange up>▲ 2.14% (24h)</StatChange>
          </StatCard>
          <StatCard>
            <StatLabel>24h Trading Volume</StatLabel>
            <StatValue>{fmt(totalVol24h)}</StatValue>
            <StatChange up>▲ 8.42% (24h)</StatChange>
          </StatCard>
          <StatCard>
            <StatLabel>24h Fees Collected</StatLabel>
            <StatValue style={{ color:'#31D0AA' }}>{fmt(totalFees24h)}</StatValue>
            <StatChange up>▲ 8.42% (24h)</StatChange>
          </StatCard>
          <StatCard>
            <StatLabel>24h Transactions</StatLabel>
            <StatValue>{(totalTxns/1000).toFixed(1)}K</StatValue>
            <StatChange up={false}>▼ 1.23% (24h)</StatChange>
          </StatCard>
        </StatGrid>

        {/* Charts */}
        <ChartGrid>
          <ChartCard>
            <ChartTitle>Total Value Locked (30d)</ChartTitle>
            <LineChart
              data={tvlHistory}
              color="#1FC7D4"
              isDark={isDark}
              formatY={v => `$${(v/1e9).toFixed(2)}B`}
            />
          </ChartCard>
          <ChartCard>
            <ChartTitle>Volume (30d)</ChartTitle>
            <LineChart
              data={volHistory}
              color="#7645D9"
              fillColor="#7645D9"
              isDark={isDark}
              formatY={v => `$${(v/1e6).toFixed(0)}M`}
            />
          </ChartCard>
        </ChartGrid>

        {/* Controls */}
        <Controls>
          <TabGroup>
            {(['overview','tokens','pairs'] as const).map(t => (
              <TabBtn key={t} active={tab===t} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </TabBtn>
            ))}
          </TabGroup>
          <Input
            placeholder="🔍 Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            scale="sm"
            style={{ maxWidth:220 }}
          />
          {tab === 'tokens' && (
            <SortSelect value={sortTokens} onChange={e => setSortTokens(e.target.value as any)}>
              <option value="volume">Volume</option>
              <option value="liquidity">Liquidity</option>
              <option value="price">Price</option>
              <option value="change">Change</option>
            </SortSelect>
          )}
          {tab === 'pairs' && (
            <SortSelect value={sortPairs} onChange={e => setSortPairs(e.target.value as any)}>
              <option value="volume">Volume</option>
              <option value="liquidity">Liquidity</option>
              <option value="fees">Fees</option>
              <option value="apr">APR</option>
            </SortSelect>
          )}
        </Controls>

        {/* Tokens table */}
        {(tab === 'overview' || tab === 'tokens') && (
          <Table style={{ marginBottom: 24 }}>
            <THead style={{ gridTemplateColumns:'40px 2fr 1fr 1fr 1fr 1fr 1fr' }}>
              <Th>#</Th><Th>Token</Th><Th>Price</Th><Th>24h Change</Th>
              <Th>24h Volume</Th><Th>Liquidity</Th><Th>Txns</Th>
            </THead>
            {tokens.map((t, i) => (
              <TRow key={t.symbol} style={{ gridTemplateColumns:'40px 2fr 1fr 1fr 1fr 1fr 1fr' }}>
                <Cell style={{ color:'#7A6EAA', fontSize:13 }}>{i+1}</Cell>
                <Cell>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <TokenLogo src={t.logoURI} symbol={t.symbol} size={28} />
                    <div>
                      <div style={{ fontWeight:700 }}>{t.symbol}</div>
                      <div style={{ fontSize:12, color:'#7A6EAA' }}>{t.name}</div>
                    </div>
                  </div>
                </Cell>
                <Cell style={{ fontFamily:'Roboto Mono,monospace', fontWeight:600 }}>
                  ${t.price > 1000 ? t.price.toFixed(2) : t.price > 1 ? t.price.toFixed(4) : t.price.toFixed(6)}
                </Cell>
                <ChangeCell up={t.change24h>=0}>{t.change24h>=0?'▲':'▼'} {Math.abs(t.change24h).toFixed(2)}%</ChangeCell>
                <Cell>{fmt(t.volume24h)}</Cell>
                <Cell>{fmt(t.liquidity)}</Cell>
                <Cell>{(t.txns24h/1000).toFixed(1)}K</Cell>
              </TRow>
            ))}
          </Table>
        )}

        {/* Pairs table */}
        {(tab === 'overview' || tab === 'pairs') && (
          <Table>
            <THead style={{ gridTemplateColumns:'40px 2fr 1fr 1fr 1fr 1fr 1fr' }}>
              <Th>#</Th><Th>Pair</Th><Th>Vol (24h)</Th><Th>Vol (7d)</Th>
              <Th>Liquidity</Th><Th>Fees (24h)</Th><Th>APR</Th>
            </THead>
            {pairs.map((p, i) => (
              <TRow key={`${p.token0}-${p.token1}`} style={{ gridTemplateColumns:'40px 2fr 1fr 1fr 1fr 1fr 1fr' }}>
                <Cell style={{ color:'#7A6EAA', fontSize:13 }}>{i+1}</Cell>
                <Cell>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <PairLogos>
                      <PairLogo1><TokenLogo src={p.logo0} symbol={p.token0} size={24} /></PairLogo1>
                      <PairLogo2><TokenLogo src={p.logo1} symbol={p.token1} size={20} /></PairLogo2>
                    </PairLogos>
                    <div style={{ fontWeight:700 }}>{p.token0}/{p.token1}</div>
                  </div>
                </Cell>
                <Cell style={{ fontWeight:600 }}>{fmt(p.volume24h)}</Cell>
                <Cell>{fmt(p.volume7d)}</Cell>
                <Cell>{fmt(p.liquidity)}</Cell>
                <Cell style={{ color:'#31D0AA', fontWeight:600 }}>{fmt(p.fees24h)}</Cell>
                <Cell style={{ color:'#1FC7D4', fontWeight:700 }}>{p.apr.toFixed(2)}%</Cell>
              </TRow>
            ))}
          </Table>
        )}
      </Content>
    </Page>
  );
}
