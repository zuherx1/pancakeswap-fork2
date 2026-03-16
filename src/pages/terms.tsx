import React from 'react';
import styled from 'styled-components';
import PageHeader from '../components/layout/PageHeader';
import { Text } from '../components/ui/Typography';

const Content = styled.div`max-width:860px; margin:0 auto; padding:40px 24px 60px;`;
const Section = styled.div`margin-bottom:32px;`;
const STitle  = styled.h2`font-size:20px; font-weight:700; margin:0 0 12px; color:${({ theme }) => theme.colors.text};`;
const Para    = styled.p`font-size:15px; line-height:1.8; color:${({ theme }) => theme.colors.textSubtle}; margin:0 0 12px;`;

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of Service" subtitle="Last updated: January 2025" />
      <Content>
        {[
          ['1. Acceptance',            'By accessing PancakeSwap you agree to these Terms. If you do not agree, do not use the platform.'],
          ['2. Description of Service','PancakeSwap is a decentralised exchange protocol running on BNB Chain. Trades are peer-to-peer and non-custodial.'],
          ['3. Eligibility',           'You must be at least 18 years old and not a resident of a restricted jurisdiction to use PancakeSwap.'],
          ['4. Risks',                 'DeFi carries significant risks including smart-contract bugs, impermanent loss, and total loss of funds. Use at your own risk.'],
          ['5. No Warranties',         'The protocol is provided "as is" without warranty of any kind. We do not guarantee uninterrupted access.'],
          ['6. Limitation of Liability','To the fullest extent permitted by law, PancakeSwap shall not be liable for any indirect, incidental, or consequential damages.'],
          ['7. Governing Law',         'These terms are governed by the laws of the applicable jurisdiction without regard to conflict-of-law provisions.'],
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
