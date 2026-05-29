import React, { useState } from "react";
import { Figurinha, EstadoFigurinha } from "../types";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  Add,
  CheckCircle,
  Flag,
  HighlightOff,
  Remove,
  Repeat,
  Sports,
  SportsSoccer,
  Star,
  WorkspacePremium,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";

const LABEL_ESTADO: Record<EstadoFigurinha, string> = {
  faltam: "Falta",
  tenho: "Tenho",
  repetida: "Repetida",
};

const ICONE_ESTADO: Record<EstadoFigurinha, React.ReactElement> = {
  faltam: <HighlightOff sx={{ fontSize: 14 }} />,
  tenho: <CheckCircle sx={{ fontSize: 14 }} />,
  repetida: <Repeat sx={{ fontSize: 14 }} />,
};

const ICONE_TIPO: Record<string, React.ReactElement> = {
  jogador: <SportsSoccer sx={{ fontSize: 22 }} />,
  time: <Flag sx={{ fontSize: 22 }} />,
  estadio: <Sports sx={{ fontSize: 22 }} />,
  especial: <Star sx={{ fontSize: 22 }} />,
  lenda: <WorkspacePremium sx={{ fontSize: 22 }} />,
};

const COR_ESTADO: Record<EstadoFigurinha, { bg: string; main: string }> = {
  faltam: { bg: "error.light", main: "error.main" },
  tenho: { bg: "success.light", main: "success.main" },
  repetida: { bg: "warning.light", main: "warning.main" },
};

interface Props {
  figurinha: Figurinha;
  estado: EstadoFigurinha;
  quantidade: number;
  onUpdated?: () => void;
}

const CardFigurinha: React.FC<Props> = ({
  figurinha,
  estado,
  quantidade,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const alterarQuantidade = async (acao: "increment" | "decrement") => {
    if (!user || loading) return;
    if (acao === "decrement" && quantidade === 0) return;

    setLoading(true);
    try {
      const code = figurinha.numero;
      await api.patch(`/collection/${acao}`, { code });
      onUpdated?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        p: 1.5,
        border: 2,
        borderColor: COR_ESTADO[estado].bg,
        bgcolor: COR_ESTADO[estado].bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        textAlign: "center",
        minHeight: 140,
        justifyContent: "center",
        userSelect: "none",
        transition: "all 0.2s",
        opacity: loading ? 0.7 : 1,
        "&:hover": {
          boxShadow: 1,
          borderColor: COR_ESTADO[estado].main,
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: "text.disabled",
          letterSpacing: "0.5px",
        }}
      >
        {figurinha.numero}
      </Typography>

      <Box sx={{ color: "text.secondary" }}>{ICONE_TIPO[figurinha.tipo]}</Box>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          lineHeight: 1.3,
          maxWidth: "100%",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {figurinha.nome}
      </Typography>

      {figurinha.pais && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.7rem" }}
        >
          {figurinha.pais}
        </Typography>
      )}

      <Chip
        icon={ICONE_ESTADO[estado]}
        label={`${LABEL_ESTADO[estado]} · ${quantidade}`}
        size="small"
        sx={{
          mt: 0.5,
          fontWeight: 600,
          fontSize: "0.72rem",
          bgcolor: COR_ESTADO[estado].bg,
          color: COR_ESTADO[estado].main,
          height: 24,
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <IconButton
          size="small"
          aria-label="Diminuir quantidade"
          disabled={loading || quantidade === 0}
          onClick={() => alterarQuantidade("decrement")}
          sx={{
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Remove fontSize="small" />
        </IconButton>

        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 20 }}>
          {quantidade}
        </Typography>

        <IconButton
          size="small"
          aria-label="Aumentar quantidade"
          disabled={loading}
          onClick={() => alterarQuantidade("increment")}
          sx={{
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>

      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.2)",
            borderRadius: 2,
          }}
        >
          <CircularProgress size={20} sx={{ color: "#fff" }} />
        </Box>
      )}
    </Box>
  );
};

export default CardFigurinha;
