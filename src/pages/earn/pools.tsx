import React, { useState } from 'react';
import styled from 'styled-components';
import { usePools } from '../../hooks/usePools';
import PoolCard from '../../components/earn/PoolCard';
import LocalStakingWidget from '../../components/earn/LocalStakingWidget';
import { Text, Heading } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import PageHeader from '../../components/layout/PageHeader';

const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
`;

const Controls = styled.div`
  max-width: 1200px; margin: 0 auto;
  padding: 24px 24px 0;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex; background: ${({ theme }) => theme.colors.input};
  border-radius: 12px; padding: 3px; gap: 2px;
`;

const FilterBtn = styled.button<{ active?: boolean }>`
  padding: 6px 14px; border-radius: 10px;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: none; cursor: pointer;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
  box-shadow: ${({ active }) => active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
`;

const SortSelect = styled.select`
  padding: 8px 12px; border-radius: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px; font-family: 'Kanit', sans-serif; cursor: pointer; outline: none;
`;

const ToggleRow = styled.div`display: flex; align-items: center; gap: 8px;`;

const Grid = styled.div`
  max-width: 1200px; margin: 0 auto;
  padding: 24px 24px 60px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const StatsRow = styled.div`
  max-width: 1200px; margin: 24px auto 0;
  padding: 0 24px;
  display: flex; gap: 16px; flex-wrap: wrap;
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; padding: 16px 24px;
  display: flex; flex-direction: column; gap: 4px;
`;

const HelpBanner = styled.div`
  max-width: 1200px; margin: 0 auto 0;
  padding: 0 24px;
`;

const Banner = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px; padding: 20px 24px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
  margin-top: 24px;
`;

export default function PoolsPage() {
  const {
    pools, search, setSearch, sortBy, setSortBy,
    filterType, setFilterType, stakedOnly, setStakedOnly,
    finishedOnly, setFinishedOnly, expandedId, setExpandedId,
    loading, stake, unstake, harvest, compoundAll,
  } = usePools();

  const [poolMode, setPoolMode] = useState<'fork' | 'local'>('fork');

  const totalLiquidity = pools.reduce((s, p) => s + p.liquidity, 0);

  return (
    <Page>
      <PageHeader
        title="🏊 Syrup Pools"
        subtitle="Stake CAKE to earn tokens. No impermanent loss. Withdraw anytime."
        background="linear-gradient(139.73deg,#F3EFFF 0%,#E5FDFF 100%)"
      />

      {/* Mode Switcher */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px 0', display: 'flex', gap: 8 }}>
        {[
          { id: 'fork',  label: '🍴 PancakeSwap Pools' },
          { id: 'local', label: '⚡ Local Staking' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setPoolMode(m.id as 'fork' | 'local')}
            style={{
              padding: '8px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              fontFamily: 'Kanit,sans-serif', cursor: 'pointer',
              background: poolMode === m.id ? '#1FC7D4' : 'transparent',
              border: `1px solid ${poolMode === m.id ? '#1FC7D4' : 'rgba(122,110,170,0.4)'}`,
              color: poolMode === m.id ? 'white' : '#7A6EAA',
              transition: 'all .15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Local Staking view ── */}
      {poolMode === 'local' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
          <LocalStakingWidget />
        </div>
      )}

      {/* ── Fork pools view ── */}
      {poolMode === 'fork' && (<>

      {/* Stats */}
      <StatsRow>
        <StatBox>
          <Text small color="textSubtle">Total Value Locked</Text>
          <Heading scale="md" style={{ color: '#1FC7D4' }}>
            ${(totalLiquidity / 1e9).toFixed(2)}B
          </Heading>
        </StatBox>
        <StatBox>
          <Text small color="textSubtle">Active Pools</Text>
          <Heading scale="md">{pools.filter(p => !p.isFinished).length}</Heading>
        </StatBox>
        <StatBox>
          <Text small color="textSubtle">Highest APY</Text>
          <Heading scale="md" style={{ color: '#31D0AA' }}>
            {Math.max(...pools.map(p => p.apy)).toFixed(2)}%
          </Heading>
        </StatBox>
      </StatsRow>

      {/* Help banner */}
      <HelpBanner>
        <Banner>
          <div>
            <Text bold style={{ fontSize: 18, marginBottom: 4 }}>🥞 Auto CAKE — Maximize your yield</Text>
            <Text small color="textSubtle">
              Auto CAKE automatically compounds your CAKE rewards — saving you gas and time!
            </Text>
          </div>
          <Text small color="primary" style={{ cursor: 'pointer' }}>Learn more →</Text>
        </Banner>
      </HelpBanner>

      {/* Controls */}
      <Controls>
        <ToggleRow>
          <Toggle checked={stakedOnly} onChange={e => setStakedOnly(e.target.checked)} scale="sm" />
          <Text small bold>Staked only</Text>
        </ToggleRow>

        <ToggleRow>
          <Toggle checked={finishedOnly} onChange={e => setFinishedOnly(e.target.checked)} scale="sm" />
          <Text small bold>Finished</Text>
        </ToggleRow>

        <FilterGroup>
          {(['all','auto','manual','community'] as const).map(f => (
            <FilterBtn key={f} active={filterType === f} onClick={() => setFilterType(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </FilterBtn>
          ))}
        </FilterGroup>

        <SortSelect value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="hot">🔥 Hot</option>
          <option value="apr">📈 APR</option>
          <option value="totalStaked">💰 Total Staked</option>
          <option value="earned">✅ Earned</option>
          <option value="latest">🆕 Latest</option>
        </SortSelect>

        <Input
          placeholder="🔍 Search pools"
          value={search}
          onChange={e => setSearch(e.target.value)}
          scale="sm"
          style={{ maxWidth: 260 }}
        />
      </Controls>

      {/* Pool grid */}
      <Grid>
        {pools.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
            <Text color="textSubtle" style={{ fontSize: 18 }}>No pools found</Text>
          </div>
        ) : (
          pools.map(pool => (
            <PoolCard
              key={pool.sousId}
              pool={pool}
              expanded={expandedId === pool.sousId}
              onExpand={() => setExpandedId(expandedId === pool.sousId ? null : pool.sousId)}
              onStake={stake}
              onUnstake={unstake}
              onHarvest={harvest}
              onCompound={compoundAll}
              loading={loading}
            />
          ))
        )}
      </Grid>
      </>)}
    </Page>
  );
}
