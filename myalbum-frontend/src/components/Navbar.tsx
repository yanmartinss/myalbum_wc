import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTema } from "../contexts/TemaContext";
import {
  DarkMode,
  EmojiEvents,
  History,
  LightMode,
  MenuBook,
  Menu as MenuIcon,
  SwapHoriz,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTema } = useTema();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { to: "/album", label: "Álbum", icon: <MenuBook fontSize="inherit" /> },
    { to: "/trocas", label: "Trocas", icon: <SwapHoriz fontSize="inherit" /> },
    {
      to: "/historico",
      label: "Histórico",
      icon: <History fontSize="inherit" />,
    },
  ];

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          sx={{
            display: { xs: "inline-flex", md: "none" },
            color: "text.secondary",
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: "auto" }}>
          <EmojiEvents sx={{ color: "primary.main" }} />
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
          {navLinks.map(({ to, label, icon }) => (
            <Button
              key={to}
              component={Link}
              to={to}
              size="small"
              sx={{
                color:
                  location.pathname === to ? "primary.main" : "text.secondary",
                bgcolor:
                  location.pathname === to ? "action.selected" : "transparent",
                fontWeight: 500,
                fontSize: "0.88rem",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                minHeight: 36,
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: "action.hover",
                  color: "text.primary",
                },
              }}
            >
              {icon}
              <Box component="span" sx={{ ml: 0.5 }}>
                {label}
              </Box>
            </Button>
          ))}
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}
        >
          <IconButton
            onClick={toggleTema}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            {mode === "dark" ? (
              <LightMode fontSize="small" />
            ) : (
              <DarkMode fontSize="small" />
            )}
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={logout}
            sx={{
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": { borderColor: "error.main", color: "error.main" },
            }}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 230,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
            <EmojiEvents sx={{ color: "primary.main" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              Copa 2026
            </Typography>
          </Box>
          <List>
            {navLinks.map(({ to, label, icon }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton
                  component={Link}
                  to={to}
                  selected={location.pathname === to}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        location.pathname === to ? "primary.main" : undefined,
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: location.pathname === to ? 600 : 400,
                          color:
                            location.pathname === to
                              ? "primary.main"
                              : "text.primary",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
