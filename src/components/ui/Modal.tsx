import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  z-index: ${({ theme }) => theme.zIndices.modalBackdrop};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
  padding: 16px;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 32px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: ${({ theme }) => theme.zIndices.modal};
  animation: ${slideUp} 0.2s ease;
`;

const ModalHeader = styled.div`
  align-items: center;
  background: transparent;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex;
  padding: 12px 24px;
  position: relative;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSubtle};
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.input}; }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

interface ModalProps {
  title?: string;
  onDismiss?: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, onDismiss, children, hideCloseButton }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onDismiss?.(); }}>
      <ModalContainer>
        {(title || !hideCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {!hideCloseButton && (
              <CloseButton onClick={onDismiss}>✕</CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;
