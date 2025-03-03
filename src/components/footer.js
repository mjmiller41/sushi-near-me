import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";

export default function Footer() {
  return (
    <footer className="p-4 text-center">
      <Typography
        variant="body2"
        align="center"
        sx={{
          color: "text.secondary",
        }}
      >
        {"Copyright © "}
        <MuiLink color="inherit" href="/">
          Sushi Near Me
        </MuiLink>{" "}
        {new Date().getFullYear()}.
      </Typography>
    </footer>
  );
}
