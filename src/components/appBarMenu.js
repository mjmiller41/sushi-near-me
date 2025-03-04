import * as React from "react";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

const pages = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export function AppBarMenu({ children }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Box
      id="appbar-menu"
      sx={{
        display: "flex",
        justifyContent: "left",
        alignItems: "center",
        flexGrow: 1,
      }}
    >
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {pages.map((page) => (
            <MenuItem key={page.href} onClick={handleCloseNavMenu}>
              <Button href={page.href}>
                <Typography sx={{ textAlign: "center" }}>
                  {page.title}
                </Typography>
              </Button>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      {children}
      <Box
        sx={{
          paddingLeft: "2rem",
          flexGrow: 1,
          justifyContent: "start",
          display: {
            xs: "none",
            md: "flex",
          },
        }}
      >
        {pages.map((page) => (
          <Button
            key={page.href}
            href={page.href}
            onClick={handleCloseNavMenu}
            sx={{ color: "white", display: "block", margin: 0 }}
          >
            {page.title}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
