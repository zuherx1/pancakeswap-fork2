import React from 'react';
import styled from 'styled-components';

const TabsWrapper = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 4px;
  gap: 2px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ active, theme }) => (active ? theme.colors.backgroundAlt : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.colors.text : theme.colors.textSubtle)};
  border: none;
  box-shadow: ${({ active }) => (active ? '0px 2px 8px rgba(0,0,0,0.1)' : 'none')};
`;

interface TabsProps {
  tabs: string[];
  activeIndex: number;
  onTabClick: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeIndex, onTabClick }) => (
  <TabsWrapper>
    {tabs.map((tab, i) => (
      <Tab key={tab} active={activeIndex === i} onClick={() => onTabClick(i)}>
        {tab}
      </Tab>
    ))}
  </TabsWrapper>
);

export default Tabs;
