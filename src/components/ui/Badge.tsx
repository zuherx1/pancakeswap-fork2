import styled, { css } from 'styled-components';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';

interface BadgeProps { variant?: BadgeVariant; outline?: boolean; }

const variantMap: Record<BadgeVariant, { bg: string; color: string }> = {
  default:   { bg: '#EFF4F5', color: '#7A6EAA' },
  success:   { bg: '#EAFBF7', color: '#31D0AA' },
  warning:   { bg: '#FFF7DC', color: '#FFB237' },
  error:     { bg: '#FDE8F2', color: '#ED4B9E' },
  info:      { bg: '#E5FDFF', color: '#1FC7D4' },
  secondary: { bg: '#EDE7FA', color: '#7645D9' },
};

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  background: ${({ variant = 'default' }) => variantMap[variant].bg};
  color: ${({ variant = 'default' }) => variantMap[variant].color};
  white-space: nowrap;

  ${({ outline, variant = 'default' }) =>
    outline &&
    css`
      background: transparent;
      border: 1px solid ${variantMap[variant].color};
    `}
`;

export const CoreTag = styled(Badge)`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 6px;
`;

export const CommunityTag = styled(Badge)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 6px;
`;

export const HotTag = styled(Badge)`
  background: linear-gradient(180deg, #FFD800 0%, #FDAB32 100%);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 6px;
`;
