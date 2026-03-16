import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=Roboto+Mono&display=swap');

  :root {
    --font-primary: 'Kanit', sans-serif;
    --font-mono: 'Roboto Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-primary);
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  img { max-width: 100%; height: auto; }

  button {
    cursor: pointer;
    font-family: var(--font-primary);
    border: none;
    outline: none;
  }

  input, textarea, select {
    font-family: var(--font-primary);
    outline: none;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.input}; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.textDisabled};
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors.textSubtle}; }

  /* PancakeSwap card styles */
  .pancake-card {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    border-radius: 24px;
    padding: 24px;
  }

  /* Number font */
  .number { font-variant-numeric: tabular-nums; }

  /* Animations */
  @keyframes pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes shine {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wiggle {
    0%,100% { transform: rotate(-3deg); }
    50%      { transform: rotate(3deg); }
  }
  @keyframes pancakeRain {
    0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
  }

  /* Toast overrides */
  .Toastify__toast {
    border-radius: 16px !important;
    font-family: var(--font-primary) !important;
    background: ${({ theme }) => theme.colors.backgroundAlt} !important;
    color: ${({ theme }) => theme.colors.text} !important;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder} !important;
  }

  /* Pancake bunny floating animation */
  .bunny-float { animation: float 3s ease-in-out infinite; }
`;

export default GlobalStyle;
