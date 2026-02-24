// This interface describes what a "theme" must contain.
// Any theme (dark, light, custom) must follow this shape.
export interface ThemeTokens {
  colors: {
    danger: string;
    background: string;
    text: string;
    mutedText: string;
    primary: string;
    track: string;
  };
  spacing: {
    sm: number;
    md: number;
    lg: number;
  };
  radius: {
    md: number;
    pill: number;
  };
  typography: {
    title: number;
    body: number;
  };
}