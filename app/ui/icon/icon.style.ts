import { ThemeTokens } from "@themes/theme";

export  default function makeIconStyles(theme: ThemeTokens) {
  return {
    vectorIcon: {
      color: theme.colors.text,
    },
    svgIcon: {
      fill: theme.colors.text,
    },
  };
}