import React, { useState } from 'react';
import styled from 'styled-components';

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const TooltipBox = styled.div<{ visible: boolean; placement?: string }>`
  position: absolute;
  background: ${({ theme }) => theme.colors.invertedContrast};
  color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.tooltip};
  z-index: ${({ theme }) => theme.zIndices.tooltip};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: none;
  transition: opacity 0.15s;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.invertedContrast};
  }
`;

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  const [visible, setVisible] = useState(false);
  return (
    <TooltipWrapper
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <TooltipBox visible={visible} placement={placement}>
        {content}
      </TooltipBox>
    </TooltipWrapper>
  );
};

export default Tooltip;
