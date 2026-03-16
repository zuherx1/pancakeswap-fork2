import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    isDark: boolean;
    siteWidth: number;
    borderRadius: {
      small: string;
      default: string;
      card: string;
      circle: string;
    };
    shadows: {
      level1: string;
      active: string;
      success: string;
      warning: string;
      focus: string;
      inset: string;
      tooltip: string;
    };
    spacing: number[];
    breakpoints: string[];
    mediaQueries: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      nav: string;
    };
    zIndices: {
      dropdown: number;
      sticky: number;
      fixed: number;
      modalBackdrop: number;
      modal: number;
      popover: number;
      tooltip: number;
    };
    colors: {
      primary: string;
      primaryBright: string;
      primaryDark: string;
      secondary: string;
      secondaryDark: string;
      background: string;
      backgroundAlt: string;
      backgroundAlt2: string;
      cardBorder: string;
      text: string;
      textSubtle: string;
      textDisabled: string;
      textTertiary: string;
      input: string;
      inputSecondary: string;
      success: string;
      warning: string;
      error: string;
      danger: string;
      disabled: string;
      invertedContrast: string;
      dropdown: string;
      dropdownDeep: string;
      overlay: string;
      binance: string;
      gradientBubblegum: string;
      gradientInverseBubblegum: string;
      gradientCardHeader: string;
      gradientBlue: string;
      gradientViolet: string;
      gradientGold: string;
      gradientBold: string;
      failure?: string;
      [key: string]: string | undefined;
    };
  }
}
