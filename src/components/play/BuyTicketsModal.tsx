import React from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Section = styled.div`margin-bottom: 20px;`;

const CountRow = styled.div`
  display: flex; align-items: center; gap: 12px;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px; padding: 12px 16px;
`;

const CountBtn = styled.button`
  width: 36px; height: 36px; border-radius: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  font-size: 20px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const CountDisplay = styled.div`
  flex: 1; text-align: center;
  font-size: 28px; font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const BulkRow = styled.div`
  display: flex; gap: 8px; margin-top: 10px;
`;

const BulkBtn = styled.button`
  flex: 1; padding: 7px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 13px; font-weight: 600;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;

const TicketList = styled.div`
  display: flex; flex-direction: column; gap: 10px;
  max-height: 260px; overflow-y: auto;
  padding-right: 4px;
`;

const TicketRow = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
`;

const TicketHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;

const NumRow = styled.div`
  display: flex; gap: 6px;
`;

const NumBall = styled.div<{ $color: string }>`
  width: 34px; height: 34px; border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: white;
  font-family: 'Roboto Mono', monospace;
  cursor: pointer; transition: transform 0.15s;
  &:hover { transform: scale(1.1); }
  box-shadow: 0 2px 8px ${({ $color }) => $color}60;
`;

const NumInput = styled.input<{ $color?: string }>`
  width: 34px; height: 34px; border-radius: 50%;
  text-align: center; border: 2px solid ${({ $color }) => $color || '#1FC7D4'};
  background: transparent; font-size: 14px; font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Roboto Mono', monospace; outline: none;
  &:focus { background: ${({ $color }) => $color || '#1FC7D4'}20; }
`;

const CostBox = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; padding: 16px; margin-bottom: 16px;
`;

const CostRow = styled.div`
  display: flex; justify-content: space-between; padding: 4px 0;
`;

const BALL_COLORS = ['#1FC7D4','#7645D9','#ED4B9E','#31D0AA','#FFB237','#F0B90B'];

interface Props {
  onDismiss:           () => void;
  buyCount:            number;
  setBuyCount:         (n: number) => void;
  editTickets:         number[][];
  randomizeTicket:     (i: number) => void;
  updateTicketNumber:  (ti: number, ni: number, v: number) => void;
  randomizeAll:        boolean;
  setRandomizeAll:     (v: boolean) => void;
  totalCost:           string;
  ticketPrice:         number;
  onBuy:               () => Promise<void>;
  buying:              boolean;
}

const BuyTicketsModal: React.FC<Props> = ({
  onDismiss, buyCount, setBuyCount, editTickets, randomizeTicket,
  updateTicketNumber, randomizeAll, setRandomizeAll,
  totalCost, ticketPrice, onBuy, buying,
}) => {
  const maxTickets = 100;

  return (
    <Modal title="🎟️ Buy Tickets" onDismiss={onDismiss}>
      {/* Count selector */}
      <Section>
        <Text small color="textSubtle" style={{ marginBottom: 8 }}>Number of Tickets</Text>
        <CountRow>
          <CountBtn onClick={() => setBuyCount(Math.max(1, buyCount - 1))} disabled={buyCount <= 1}>−</CountBtn>
          <CountDisplay>{buyCount}</CountDisplay>
          <CountBtn onClick={() => setBuyCount(Math.min(maxTickets, buyCount + 1))} disabled={buyCount >= maxTickets}>+</CountBtn>
        </CountRow>
        <BulkRow>
          {[1, 5, 10, 25, 50, 100].map(n => (
            <BulkBtn key={n} onClick={() => setBuyCount(n)}>{n}</BulkBtn>
          ))}
        </BulkRow>
      </Section>

      {/* Ticket editor */}
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text small bold>Your Tickets</Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button scale="sm" variant="tertiary"
              onClick={() => editTickets.forEach((_, i) => randomizeTicket(i))}>
              🎲 Randomize All
            </Button>
          </div>
        </div>

        <TicketList>
          {editTickets.map((ticket, ti) => (
            <TicketRow key={ti}>
              <TicketHeader>
                <Text small color="textSubtle">Ticket #{ti + 1}</Text>
                <Button scale="sm" variant="text" onClick={() => randomizeTicket(ti)}>🎲 Random</Button>
              </TicketHeader>
              <NumRow>
                {ticket.map((num, ni) => (
                  <div key={ni} style={{ position: 'relative' }}>
                    <NumInput
                      type="number"
                      min={0}
                      max={9}
                      value={num}
                      $color={BALL_COLORS[ni]}
                      onChange={e => updateTicketNumber(ti, ni, parseInt(e.target.value) || 0)}
                      style={{ borderColor: BALL_COLORS[ni] }}
                    />
                  </div>
                ))}
              </NumRow>
            </TicketRow>
          ))}
        </TicketList>
      </Section>

      {/* Cost breakdown */}
      <CostBox>
        <CostRow>
          <Text small color="textSubtle">{buyCount} ticket{buyCount > 1 ? 's' : ''} × {ticketPrice} CAKE</Text>
          <Text small bold>{(buyCount * ticketPrice).toFixed(3)} CAKE</Text>
        </CostRow>
        {buyCount >= 50 && (
          <CostRow>
            <Text small color="success">Bulk discount (50+)</Text>
            <Text small bold color="success">−{((buyCount * ticketPrice) * 0.05).toFixed(3)} CAKE</Text>
          </CostRow>
        )}
        {buyCount >= 100 && (
          <CostRow>
            <Text small color="success">Bulk discount (100)</Text>
            <Text small bold color="success">−{((buyCount * ticketPrice) * 0.05).toFixed(3)} CAKE</Text>
          </CostRow>
        )}
        <div style={{ borderTop: `1px solid`, marginTop: 8, paddingTop: 8 }}>
          <CostRow>
            <Text bold>Total Cost</Text>
            <Text bold style={{ fontSize: 18, color: '#1FC7D4' }}>{totalCost} CAKE</Text>
          </CostRow>
        </div>
      </CostBox>

      <Text small color="textSubtle" style={{ marginBottom: 12, fontSize: 11 }}>
        🎟️ Tickets are entered into the lottery draw. Numbers must be unique per ticket for best odds.
      </Text>

      <Button
        fullWidth scale="lg"
        onClick={async () => { await onBuy(); onDismiss(); }}
        isLoading={buying}
        disabled={buying}
      >
        {buying ? 'Confirming…' : `Buy ${buyCount} Ticket${buyCount > 1 ? 's' : ''} →`}
      </Button>
    </Modal>
  );
};

export default BuyTicketsModal;
