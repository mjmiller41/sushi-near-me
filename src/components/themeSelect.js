"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useColorScheme } from "@mui/material/styles";

export const ThemeSelect = ({ handleClose, ...props }) => {
  const { mode, setMode } = useColorScheme();

  // Update mode and persist it
  const handleChange = (event) => {
    handleClose();
    setMode(event.target.value);
  };

  return (
    <Box {...props}>
      <FormControl>
        <RadioGroup row value={mode} onChange={handleChange}>
          <FormControlLabel value="system" control={<Radio />} label="System" />
          <FormControlLabel value="light" control={<Radio />} label="Light" />
          <FormControlLabel value="dark" control={<Radio />} label="Dark" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
