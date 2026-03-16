import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

interface LayoutProps {
  children: React.ReactNode;
  noFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, noFooter }) => (
  <Wrapper>
    <Header />
    <Main>{children}</Main>
    {!noFooter && <Footer />}
  </Wrapper>
);

export default Layout;
