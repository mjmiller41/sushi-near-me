"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Link from "@mui/material/Link";
import { AppBarMenu } from "./appBarMenu";
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
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <AppBarMenu>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 0,
                display: { xs: "none", sm: "block" },
              }}
            >
              <Link
                href="/"
                sx={{ color: "var(--AppBar-color)", textDecoration: "none" }}
              >
                Sushi Near Me
              </Link>
            </Typography>
          </AppBarMenu>
          <Autocomplete
            id="autocomplete-input"
            blurOnSelect
            sx={{
              width: 300,
              flexGrow: 0,
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
