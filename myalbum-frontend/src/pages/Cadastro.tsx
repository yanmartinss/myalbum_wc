import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTema } from "../contexts/TemaContext";
import {
  DarkMode,
  EmojiEvents,
  HowToReg,
  LightMode,
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

const Cadastro: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const { cadastrar, erro, limparErro } = useAuth();
  const { mode, toggleTema } = useTema();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    setErroLocal(null);

    try {
      if (senha !== confirmarSenha)
        return setErroLocal("Passwords must be the same.");
      await cadastrar(email, name, senha); // sem confirmPassword na API
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
            Criar Conta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Álbum Panini — Cadastre-se para começar
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {(erro || erroLocal) && (
            <Alert
              severity="error"
              onClose={() => {
                limparErro();
                setErroLocal(null);
              }}
              sx={{ cursor: "pointer", color: "red" }}
            >
              {erroLocal || erro}
            </Alert>
          )}

          <TextField
            label="E-mail"
            type="text"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            size="medium"
          />

          <TextField
            label="Nome de usuário"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="medium"
          />

          <TextField
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            fullWidth
            size="medium"
          />

          <TextField
            label="Confirmar Senha"
            type="password"
            placeholder="••••••••"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            fullWidth
            size="medium"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 1, py: 1.5, fontWeight: 700, gap: 1 }}
          >
            <HowToReg /> Criar Conta
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Já tem conta?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Entrar
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Cadastro;
