import styled, { css, DefaultTheme } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'text' | 'danger' | 'subtle' | 'light';
type Scale = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: Variant;
  scale?: Scale;
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

const scaleStyles = {
  sm: css`padding: 2px 8px; font-size: 14px; height: 32px;`,
  md: css`padding: 4px 16px; font-size: 16px; height: 40px;`,
  lg: css`padding: 8px 24px; font-size: 16px; height: 48px;`,
  xl: css`padding: 12px 32px; font-size: 20px; height: 56px;`,
};

const variantStyles = (theme: DefaultTheme) => ({
  primary: css`
    background: ${theme.colors.primary};
    color: white;
    &:hover:not(:disabled) { background: ${theme.colors.primaryDark}; }
    box-shadow: 0px -1px 0px rgba(14,14,44,0.4) inset;
  `,
  secondary: css`
    background: ${theme.colors.secondary};
    color: white;
    &:hover:not(:disabled) { background: ${theme.colors.secondaryDark}; }
    box-shadow: 0px -1px 0px rgba(14,14,44,0.4) inset;
  `,
  tertiary: css`
    background: ${theme.colors.input};
    color: ${theme.colors.primary};
    box-shadow: none;
    &:hover:not(:disabled) { opacity: 0.9; }
  `,
  text: css`
    background: transparent;
    color: ${theme.colors.primary};
    box-shadow: none;
    padding: 0;
    &:hover:not(:disabled) { opacity: 0.65; }
  `,
  danger: css`
    background: ${theme.colors.danger};
    color: white;
    &:hover:not(:disabled) { opacity: 0.85; }
    box-shadow: 0px -1px 0px rgba(14,14,44,0.4) inset;
  `,
  subtle: css`
    background: ${theme.colors.backgroundAlt};
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.cardBorder};
    &:hover:not(:disabled) { border-color: ${theme.colors.primary}; }
    box-shadow: none;
  `,
  light: css`
    background: transparent;
    color: ${theme.colors.textSubtle};
    box-shadow: none;
    &:hover:not(:disabled) { background: ${theme.colors.input}; }
  `,
});

export const Button = styled.button<ButtonProps>`
  align-items: center;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  display: inline-flex;
  font-family: 'Kanit', sans-serif;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
  outline: 0;
  transition: background-color 0.2s, opacity 0.2s;
  white-space: nowrap;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  position: relative;
  gap: 8px;

  ${({ scale = 'md' }) => scaleStyles[scale]}
  ${({ variant = 'primary', theme }) => variantStyles(theme)[variant]}

  &:disabled {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
    box-shadow: none;
  }

  ${({ isLoading }) =>
    isLoading &&
    css`
      cursor: not-allowed;
      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        right: 12px;
      }
    `}
`;

export const IconButton = styled(Button)`
  border-radius: 50%;
  padding: 0;
  width: 40px;
  height: 40px;
`;
