import styled, { css } from 'styled-components';

type Scale = 'md' | 'sm' | 'xs';
type Color = 'primary' | 'secondary' | 'text' | 'textSubtle' | 'textDisabled' | 'success' | 'warning' | 'failure';

interface TextProps {
  scale?: Scale;
  color?: string;
  bold?: boolean;
  small?: boolean;
  ellipsis?: boolean;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
}

export const Text = styled.p<TextProps>`
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  font-size: ${({ fontSize, small, scale }) => {
    if (fontSize) return fontSize;
    if (small || scale === 'sm') return '14px';
    if (scale === 'xs') return '12px';
    return '16px';
  }};
  color: ${({ color, theme }) => {
    if (!color) return theme.colors.text;
    if (color in theme.colors) return theme.colors[color as keyof typeof theme.colors];
    return color;
  }};
  text-transform: ${({ textTransform }) => textTransform || 'none'};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  margin: 0;
  padding: 0;
  ${({ ellipsis }) =>
    ellipsis &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
`;

export const Heading = styled(Text).attrs({ as: 'h2' })<{ scale?: 'md' | 'lg' | 'xl' | 'xxl' }>`
  font-weight: 600;
  line-height: 1.1;
  font-size: ${({ scale }) => {
    if (scale === 'xxl') return '64px';
    if (scale === 'xl') return '40px';
    if (scale === 'lg') return '32px';
    return '20px';
  }};
  color: ${({ color, theme }) => (color ? (theme.colors[color as keyof typeof theme.colors] || color) : theme.colors.text)};
  margin: 0;
`;

export const Label = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
