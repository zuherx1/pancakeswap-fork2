import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import styled from 'styled-components';

const Content = styled.div`max-width:860px; margin:0 auto; padding:40px 24px 60px;`;
const Section = styled.div`margin-bottom:32px;`;
const STitle  = styled.h2`font-size:20px; font-weight:700; margin:0 0 12px; color:${({ theme }) => theme.colors.text};`;
const Para    = styled.p`font-size:15px; line-height:1.8; color:${({ theme }) => theme.colors.textSubtle}; margin:0 0 12px;`;

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" subtitle="Last updated: January 2025" />
      <Content>
        {[
          ['Information We Collect',  'We collect wallet addresses, transaction data, and usage analytics. We do not collect personally identifiable information.'],
          ['How We Use Information',  'Analytics data is used solely to improve the protocol. We never sell your data to third parties.'],
          ['Cookies',                 'We use minimal cookies for theme preferences and session management only.'],
          ['Third-Party Services',    'We use Chainlink for oracle data and ChangeNow for exchange services. Their respective privacy policies apply.'],
          ['Security',                'All data is handled in accordance with industry best practices. Smart contracts are audited regularly.'],
          ['Contact',                 'For privacy concerns, contact us through our official Telegram or Discord channels.'],
        ].map(([title, body]) => (
          <Section key={title as string}>
            <STitle>{title}</STitle>
            <Para>{body}</Para>
          </Section>
        ))}
      </Content>
    </>
  );
}
