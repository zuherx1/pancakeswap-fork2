import React from 'react';
import styled from 'styled-components';

interface ToggleProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scale?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizes = {
  sm: { width: 36, height: 20, knob: 16, offset: 2 },
  md: { width: 48, height: 28, knob: 22, offset: 3 },
  lg: { width: 60, height: 32, knob: 26, offset: 3 },
};

const Wrapper = styled.label<{ scale: 'sm' | 'md' | 'lg'; disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: inline-block;
  position: relative;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  width: ${({ scale }) => sizes[scale].width}px;
  height: ${({ scale }) => sizes[scale].height}px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const Slider = styled.span<{ scale: 'sm' | 'md' | 'lg'; checked: boolean }>`
  background: ${({ checked, theme }) => (checked ? theme.colors.success : theme.colors.input)};
  border-radius: ${({ scale }) => sizes[scale].height / 2}px;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: background 0.2s;
  border: 2px solid ${({ checked, theme }) => (checked ? theme.colors.success : theme.colors.inputSecondary)};

  &::before {
    background: white;
    border-radius: 50%;
    bottom: ${({ scale }) => sizes[scale].offset - 2}px;
    content: '';
    height: ${({ scale }) => sizes[scale].knob}px;
    left: ${({ scale }) => sizes[scale].offset - 2}px;
    position: absolute;
    transition: transform 0.2s;
    width: ${({ scale }) => sizes[scale].knob}px;
    transform: ${({ checked, scale }) =>
      checked
        ? `translateX(${sizes[scale].width - sizes[scale].knob - (sizes[scale].offset - 2) * 2}px)`
        : 'translateX(0)'};
    box-shadow: 0 0 4px rgba(0,0,0,0.2);
  }
`;

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, scale = 'md', disabled }) => (
  <Wrapper scale={scale} disabled={disabled}>
    <HiddenInput type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <Slider scale={scale} checked={checked} />
  </Wrapper>
);

export default Toggle;
