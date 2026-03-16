import React from 'react';
import styled from 'styled-components';
import { Text } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Position } from '../../hooks/usePerps';

const Wrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  font-size: 13px;
`;

const Th = styled.th`
  padding: 8px 12px;
  text-align: left;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  font-size: 13px;
  white-space: nowrap;
  font-family: 'Roboto Mono', monospace;
`;

const SideBadge = styled.span<{ side: string }>`
  background: ${({ side, theme }) => side === 'long' ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ side, theme }) => side === 'long' ? theme.colors.success : theme.colors.danger};
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Kanit', sans-serif;
`;

const PnlText = styled.span<{ positive: boolean }>`
  color: ${({ positive, theme }) => positive ? theme.colors.success : theme.colors.danger};
  font-weight: 600;
`;

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const TabBtn = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  transition: all 0.15s;
`;

interface Props {
  positions:     Position[];
  onClose:       (id: string) => void;
  activeTab:     string;
  setActiveTab:  (t: any) => void;
}

const PositionsTable: React.FC<Props> = ({ positions, onClose, activeTab, setActiveTab }) => {
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid', gap: 0 }}>
        {['positions','orders','history'].map(t => (
          <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'positions' && positions.length > 0 && (
              <span style={{ marginLeft: 4, background: '#1FC7D4', color: 'white', borderRadius: '50%', padding: '0 5px', fontSize: 10 }}>
                {positions.length}
              </span>
            )}
          </TabBtn>
        ))}
      </div>

      <Wrapper>
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <Empty>No open positions</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Symbol</Th>
                  <Th>Side</Th>
                  <Th>Size</Th>
                  <Th>Entry Price</Th>
                  <Th>Mark Price</Th>
                  <Th>Liq. Price</Th>
                  <Th>Margin</Th>
                  <Th>PnL (ROE%)</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {positions.map(p => (
                  <tr key={p.id}>
                    <Td style={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>{p.symbol}</Td>
                    <Td><SideBadge side={p.side}>{p.side === 'long' ? '▲ Long' : '▼ Short'}</SideBadge></Td>
                    <Td>{p.size} / {p.leverage}×</Td>
                    <Td>{p.entryPrice.toFixed(2)}</Td>
                    <Td>{p.markPrice.toFixed(2)}</Td>
                    <Td style={{ color: '#ED4B9E' }}>{p.liquidation.toFixed(2)}</Td>
                    <Td>{p.margin.toFixed(2)} USDT</Td>
                    <Td>
                      <PnlText positive={p.pnl >= 0}>
                        {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(4)} USDT
                        ({p.pnlPct >= 0 ? '+' : ''}{p.pnlPct.toFixed(2)}%)
                      </PnlText>
                    </Td>
                    <Td>
                      <Button scale="sm" variant="danger" onClick={() => onClose(p.id)}>Close</Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )
        )}
        {activeTab === 'orders' && <Empty>No open orders</Empty>}
        {activeTab === 'history' && <Empty>No order history</Empty>}
      </Wrapper>
    </div>
  );
};

export default PositionsTable;
