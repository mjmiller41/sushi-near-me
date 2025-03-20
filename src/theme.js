"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: {
    dark: true,
    light: true,
  },
  cssVariables: {
    colorSchemeSelector: "data",
  },
  typography: {
    fontFamily: "var(--font-roboto)",
    backLink: {
      display: "block",
      textAlign: "left",
      fontSize: ".8rem",
      padding: ".25rem 0",
    },
  },
  components: {
    MuiRating: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root": {
            fill: "var(--mui-palette-warning-light)",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: "1.8rem",
          "@media (min-width:600px)": {
            fontSize: "2rem",
          },
          "@media (min-width:900px)": {
            fontSize: "2.5rem",
          },
        },
        h2: {
          fontSize: "1.3rem",
          "@media (min-width:600px)": {
            fontSize: "1.5rem",
          },
          "@media (min-width:900px)": {
            fontSize: "2rem",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          width: "100%",
          "& *": {
            color: "var(--mui-palette-text-primary)",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => [
          {
            backgroundColor: theme.palette.primary.main,
            padding: "0.5rem",
            "& .MuiCardHeader-title": {
              fontSize: "1.2rem",
            },
          },
          theme.applyStyles("dark", {
            backgroundColor: theme.palette.grey[800],
          }),
        ],
      },
    },
  },
});

export { theme };
