import styled, { css } from 'styled-components';

interface CardProps {
  isActive?: boolean;
  isSuccess?: boolean;
  isWarning?: boolean;
  isDisabled?: boolean;
  ribbon?: React.ReactNode;
  background?: string;
}

export const Card = styled.div<CardProps>`
  background: ${({ theme, background }) => background || theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s;

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border: 1px solid ${theme.colors.secondary};
      box-shadow: ${theme.shadows.active};
    `}

  ${({ isSuccess, theme }) =>
    isSuccess &&
    css`
      border: 1px solid ${theme.colors.success};
      box-shadow: ${theme.shadows.success};
    `}

  ${({ isWarning, theme }) =>
    isWarning &&
    css`
      border: 1px solid ${theme.colors.warning};
    `}

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      opacity: 0.7;
      pointer-events: none;
    `}
`;

export const CardHeader = styled.div<{ background?: string }>`
  background: ${({ background, theme }) => background || theme.colors.gradientCardHeader};
  padding: 24px;
`;

export const CardBody = styled.div<{ p?: string }>`
  padding: ${({ p }) => p || '24px'};
`;

export const CardFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 24px;
`;

export const CardRibbon = styled.div<{ variantColor?: string }>`
  background-color: ${({ theme, variantColor }) => variantColor || theme.colors.secondary};
  color: white;
  margin: 0;
  padding: 0 8px;
  position: absolute;
  right: 0;
  top: 31px;
  transform: translateX(30%) translateY(0%) rotate(45deg) translateX(-50%);
  transform-origin: top left;
  z-index: 1;
  font-size: 14px;
  font-weight: 600;

  &::before, &::after {
    background-color: ${({ theme, variantColor }) => variantColor || theme.colors.secondary};
    content: '';
    height: 100%;
    margin: 0 -1px;
    position: absolute;
    top: 0;
    width: 100%;
  }
  &::before { right: 100%; }
  &::after { left: 100%; }
`;
