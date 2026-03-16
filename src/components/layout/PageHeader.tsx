import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div<{ background?: string }>`
  background: ${({ background, theme }) => background || theme.colors.gradientBubblegum};
  padding: 40px 24px;
`;

const Inner = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
  font-family: 'Kanit', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
`;

const Extra = styled.div`
  margin-top: 24px;
`;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  background?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, background, children }) => (
  <Wrapper background={background}>
    <Inner>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {children && <Extra>{children}</Extra>}
    </Inner>
  </Wrapper>
);

export default PageHeader;
