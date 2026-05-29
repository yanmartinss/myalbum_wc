import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTema } from "../contexts/TemaContext";
import {
  DarkMode,
  EmojiEvents,
  History,
  LightMode,
  MenuBook,
  SwapHoriz,
} from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from "@mui/material";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTema } = useTema();
  const location = useLocation();

  const navLinks = [
    { to: "/album", label: "Álbum", icon: <MenuBook fontSize="inherit" /> },
    { to: "/trocas", label: "Trocas", icon: <SwapHoriz fontSize="inherit" /> },
    { to: "/historico", label: "Histórico", icon: <History fontSize="inherit" /> },
  ];

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
          <EmojiEvents sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Copa 2026
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Álbum Panini
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {navLinks.map(({ to, label, icon }) => (
            <Button
              key={to}
              component={Link}
              to={to}
              size="small"
              sx={{
                color: location.pathname === to ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === to ? 'action.selected' : 'transparent',
                fontWeight: 500,
                fontSize: '0.88rem',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                minHeight: 36,
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              {icon}
              <Box component="span" sx={{ ml: 0.5 }}>{label}</Box>
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
          <IconButton onClick={toggleTema} size="small" sx={{ color: 'text.secondary' }}>
            {mode === "dark" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {user?.email}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={logout}
            sx={{ color: 'text.secondary', borderColor: 'divider', '&:hover': { borderColor: 'error.main', color: 'error.main' } }}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
