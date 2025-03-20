"use client";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { Box } from "@mui/material";

export default function Footer(props) {
  return (
    <Box
      sx={[
        {
          width: "100%",
          height: "3rem",
          marginTop: "1rem",
          padding: ".8rem",
          color: "text.primary",
          backgroundColor: "primary.main",
        },
        (theme) => {
          return theme.applyStyles("dark", {
            backgroundColor: "#272727",
          });
        },
      ]}
      {...props}
    >
      <Typography variant="body2" align="center">
        {"Copyright © "}
        <MuiLink color="inherit" href="/">
          Sushi Near Me
        </MuiLink>{" "}
        {new Date().getFullYear()}.
      </Typography>
    </Box>
  );
}
