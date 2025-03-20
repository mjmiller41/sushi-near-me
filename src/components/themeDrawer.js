"use client";
import { useState } from "react";
import {
  Box,
  ClickAwayListener,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  useColorScheme,
} from "@mui/material";
// import { ThemeSelect } from "./themeSelect";
import { LightMode } from "@mui/icons-material";
// import dynamic from "next/dynamic";
// const ThemeSelect = dynamic(
//   () => import("./themeSelect").then((mod) => mod.ThemeSelect),
//   { ssr: false }
// );

export const ThemeDrawer = () => {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useColorScheme();
  if (!mode) return null;

  const handleClose = () => {
    setOpen(false);
  };

  // Update mode and persist it
  const handleChange = (event) => {
    handleClose();
    setMode(event.target.value);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Drawer content */}
      <ClickAwayListener onClickAway={handleClose}>
        <Box
          sx={[
            {
              position: "absolute",
              top: open ? "5rem" : "1.75rem",
              left: 0,
              height: "5.75rem",
              borderTop: "none",
              overflow: "hidden",
              transition: "top 0.3s ease-in-out",
              backgroundColor: "transparent",
              color: "text.primary",
              pointerEvents: "none",
              zIndex: 1,
            },
          ]}
        >
          <Box
            sx={[
              {
                position: "relative",
                height: "3.25rem",
                paddingTop: "5px",
                borderBottomRightRadius: 10,
                pointerEvents: "auto",
                backgroundColor: "primary.light",
                zIndex: 1,
              },
              (theme) => {
                return theme.applyStyles("dark", {
                  backgroundColor: "var(--mui-palette-grey-800)", //theme.vars.palette.grey[800],
                });
              },
            ]}
          >
            <FormControl>
              <FormLabel id="demo-theme-toggle"></FormLabel>
              <RadioGroup
                aria-labelledby="demo-theme-toggle"
                name="theme-toggle"
                row
                value={mode}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="system"
                  control={<Radio />}
                  label="System"
                />
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label="Light"
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label="Dark"
                />
              </RadioGroup>
            </FormControl>
          </Box>
          {/* Tab button */}
          <Box
            id="tab-button"
            sx={[
              {
                position: "relative",
                bottom: "1px",
                left: 0,
                display: "inline-block",
                padding: ".5rem .6rem .5rem .4rem",
                height: "2.5rem",
                borderBottomRightRadius: 10,
                backgroundColor: "primary.light",
                textAlign: "center",
                cursor: "pointer",
                pointerEvents: "auto",
                zIndex: 1,
              },
              (theme) => {
                return theme.applyStyles("dark", {
                  backgroundColor: "var(--mui-palette-grey-800)", // theme.vars.palette.grey[800],
                });
              },
            ]}
            onClick={toggleDrawer}
          >
            <LightMode />
          </Box>
        </Box>
      </ClickAwayListener>
    </>
  );
};
