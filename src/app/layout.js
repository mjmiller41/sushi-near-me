"use client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { USMap } from "@/components/USMap";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import { Box, Container } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useEffect } from "react";
import { theme } from "../theme";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StateContext } from "@/components/StateContext";
// import "@/app/globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default function RootLayout({ children }) {
  const [state, setState] = useState();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} disableTransitionOnChange>
            <CssBaseline />
            <InitColorSchemeScript attribute="data" />
            <Box
              component={"div"}
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Header component={"header"} />
              <Container
                component={"main"}
                style={{ maxWidth: "900px", flexGrow: 1, marginTop: "2rem" }}
              >
                <USMap state={state} />
                <StateContext.Provider value={setState}>
                  {children}
                </StateContext.Provider>
              </Container>
              <Footer component={"footer"} />
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
