import styled, { css } from 'styled-components';

interface InputProps {
  scale?: 'sm' | 'md' | 'lg';
  isSuccess?: boolean;
  isWarning?: boolean;
}

export const Input = styled.input<InputProps>`
  background-color: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.inset};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  font-family: 'Kanit', sans-serif;
  font-size: 16px;
  outline: 0;
  padding: 8px 16px;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;

  ${({ scale }) =>
    scale === 'sm' &&
    css`
      padding: 4px 8px;
      font-size: 14px;
    `}

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }

  ${({ isSuccess, theme }) =>
    isSuccess &&
    css`
      border-color: ${theme.colors.success};
      box-shadow: ${theme.shadows.success};
    `}

  ${({ isWarning, theme }) =>
    isWarning &&
    css`
      border-color: ${theme.colors.warning};
    `}
`;

export const NumericalInput = styled(Input)`
  font-size: 28px;
  font-weight: 600;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  text-align: left;

  &:focus {
    border: none;
    box-shadow: none;
  }
`;
