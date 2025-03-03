"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { slugify } from "@/lib/utils";
import { throttle } from "lodash";

export default function Header() {
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const router = useRouter();

  const fetchData = async (query) => {
    if (!query?.trim()) {
      setOptions([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/autocomplete?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      const result = data.map((res, index) => {
        return {
          link: `/${res.state}/${slugify(res.city)}/${slugify(res.name)}`,
          name: res.name,
        };
      });
      setOptions(result);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setOptions([]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledFetchData = useCallback(throttle(fetchData, 300), []);

  useEffect(() => {
    if (selectedOption) {
      setOptions([]);
      setInputValue("");
      setValue(selectedOption.name);
      router.push(selectedOption.link);
      setSelectedOption(null);
    } else if (inputValue) {
      setInputValue(inputValue);
      // debouncedFetchData(inputValue);
      throttledFetchData(inputValue);
    }
  }, [inputValue, selectedOption, router, throttledFetchData]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            SushiNearMe
          </Typography>

          <Autocomplete
            id="autocomplete-input"
            blurOnSelect
            sx={{
              width: 300,
              color: "text.primary",
              borderColor: "text.primary",
            }}
            options={options}
            value={value}
            noOptionsText="Search results..."
            onChange={(_, option) => setSelectedOption(option)}
            inputValue={inputValue}
            onInputChange={(_, iValue) => setInputValue(iValue)}
            getOptionLabel={(option) => option.name || ""}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField {...params} label="Search restaurants..." />
            )}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
