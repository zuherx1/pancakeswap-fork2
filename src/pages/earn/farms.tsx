import React from 'react';
import styled from 'styled-components';
import { useFarms } from '../../hooks/useFarms';
import FarmCard from '../../components/earn/FarmCard';
import { Button } from '../../components/ui/Button';
import { Text, Heading } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import PageHeader from '../../components/layout/PageHeader';

const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
`;

const Controls = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
`;

const FilterBtn = styled.button<{ active?: boolean }>`
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  border: none; cursor: pointer;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
  box-shadow: ${({ active }) => active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  outline: none;
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 180px;
  max-width: 300px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FarmList = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  padding: 0 24px;
  gap: 16px;

  @media (max-width: 968px) { display: none; }
`;

const Th = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default function FarmsPage() {
  const {
    farms, search, setSearch, sortBy, setSortBy,
    filterType, setFilterType, stakedOnly, setStakedOnly,
    expandedPid, setExpandedPid, loading, stake, unstake, harvest,
  } = useFarms();

  const totalLiquidity = farms.reduce((s, f) => s + f.liquidity, 0);

  return (
    <Page>
      <PageHeader
        title="🌾 Farms"
        subtitle="Stake LP tokens to earn CAKE. Unstake at any time."
        background="linear-gradient(139.73deg, #E5FDFF 0%, #F3EFFF 100%)"
      />

      {/* Global stats */}
      <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 24px' }}>
        <StatsRow style={{ padding: 0, margin: 0 }}>
          <StatBox>
            <Text small color="textSubtle">Total Liquidity</Text>
            <Heading scale="md" style={{ color: '#1FC7D4' }}>
              ${(totalLiquidity / 1e9).toFixed(2)}B
            </Heading>
          </StatBox>
          <StatBox>
            <Text small color="textSubtle">Active Farms</Text>
            <Heading scale="md">{farms.length}</Heading>
          </StatBox>
          <StatBox>
            <Text small color="textSubtle">CAKE/block</Text>
            <Heading scale="md" style={{ color: '#31D0AA' }}>40</Heading>
          </StatBox>
        </StatsRow>
      </div>

      {/* Controls */}
      <Controls>
        <ToggleRow>
          <Toggle
            checked={stakedOnly}
            onChange={e => setStakedOnly(e.target.checked)}
            scale="sm"
          />
          <Text small bold>Staked only</Text>
        </ToggleRow>

        <FilterGroup>
          {(['all','core','community'] as const).map(f => (
            <FilterBtn key={f} active={filterType === f} onClick={() => setFilterType(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </FilterBtn>
          ))}
        </FilterGroup>

        <SortSelect value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="hot">🔥 Hot</option>
          <option value="apr">📈 APR</option>
          <option value="liquidity">💧 Liquidity</option>
          <option value="earned">💰 Earned</option>
          <option value="latest">🆕 Latest</option>
        </SortSelect>

        <SearchWrap>
          <Input
            placeholder="🔍 Search farms"
            value={search}
            onChange={e => setSearch(e.target.value)}
            scale="sm"
          />
        </SearchWrap>
      </Controls>

      {/* Table header */}
      <div style={{ maxWidth: 1200, margin: '16px auto 8px', padding: '0 24px' }}>
        <TableHeader>
          <Th>Farm</Th>
          <Th>Earned</Th>
          <Th>APR</Th>
          <Th>Liquidity</Th>
          <Th>Multiplier</Th>
          <Th></Th>
        </TableHeader>
      </div>

      {/* Farm list */}
      <FarmList>
        {farms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Text color="textSubtle" style={{ fontSize: 18 }}>No farms found</Text>
          </div>
        ) : (
          farms.map(farm => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              expanded={expandedPid === farm.pid}
              onExpand={() => setExpandedPid(expandedPid === farm.pid ? null : farm.pid)}
              onStake={stake}
              onUnstake={unstake}
              onHarvest={harvest}
              loading={loading}
            />
          ))
        )}
      </FarmList>
    </Page>
  );
}
