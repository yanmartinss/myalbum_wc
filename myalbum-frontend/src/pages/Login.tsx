import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTema } from "../contexts/TemaContext";
import {
  DarkMode,
  EmojiEvents,
  LightMode,
  SportsSoccer,
  Sync,
} from "@mui/icons-material";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
} from "@mui/material";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { login, erro, limparErro, carregando } = useAuth();
  const { mode, toggleTema } = useTema();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, senha);
      navigate("/album");
    } catch {
      // erro já está no context (erro)
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <IconButton
        onClick={toggleTema}
        size="small"
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 2,
          color: "text.secondary",
        }}
      >
        {mode === "dark" ? <LightMode /> : <DarkMode />}
      </IconButton>
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[
          { size: 500, top: -100, left: -100, delay: 0 },
          { size: 400, bottom: -80, right: -80, delay: -3 },
          { size: 300, top: "50%", left: "50%", delay: -6, opacity: 0.05 },
        ].map((circle, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              width: circle.size,
              height: circle.size,
              bgcolor: "primary.main",
              opacity: circle.opacity ?? 0.08,
              filter: "blur(80px)",
              animation: "float 8s ease-in-out infinite",
              animationDelay: `${circle.delay}s`,
              top: circle.top,
              left: circle.left,
              bottom: circle.bottom,
              right: circle.right,
              transform:
                circle.top === "50%" ? "translate(-50%, -50%)" : undefined,
            }}
          />
        ))}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          zIndex: 1,
          p: { xs: 4, md: 6 },
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: 8,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <EmojiEvents sx={{ fontSize: 48, color: "primary.main", mb: 1.5 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Copa 2026
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Álbum Panini — Acesse sua conta
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {erro && (
            <Alert
              severity="error"
              onClick={limparErro}
              sx={{ cursor: "pointer", color: "red" }}
            >
              {erro}
            </Alert>
          )}

          <TextField
            id="email"
            label="E-mail"
            type="text"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            fullWidth
            size="medium"
          />

          <TextField
            id="senha"
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            fullWidth
            size="medium"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={carregando}
            fullWidth
            sx={{ mt: 1, py: 1.5, fontWeight: 700, gap: 1 }}
          >
            {carregando ? (
              <Box className="spinner-btn" />
            ) : (
              <>
                <SportsSoccer /> Entrar no Álbum
              </>
            )}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Não tem conta?{" "}
          <Link to="/cadastro" style={{ fontWeight: 600 }}>
            Cadastre-se
          </Link>
        </Typography>

        <Typography
          variant="caption"
          color="text.disabled"
          align="center"
          sx={{ display: "block", mt: 2, lineHeight: 1.6 }}
        >
          Este álbum é compartilhado entre dois usuários.
          <br />
          Qualquer alteração é sincronizada em tempo real!{" "}
          <Sync sx={{ fontSize: 14, verticalAlign: "middle" }} />
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
