import React from "react";
import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import {
  CollectionCounts,
  CollectionItem,
  getCollectionStats,
  statsFromCounts,
} from "../utils/mapCollectionToAlbum";

interface Props {
  collection?: CollectionItem[];
  counts?: CollectionCounts;
}

const BarraProgresso: React.FC<Props> = ({ collection, counts }) => {
  if (!counts && (!collection || collection.length === 0)) return null;

  const { total, tenho, repetidas, faltam, percentual } = counts
    ? statsFromCounts(counts)
    : getCollectionStats(collection!);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1.5, md: 4 },
          mb: 2,
        }}
      >
        {[
          { label: "Coladas", valor: tenho, cor: "success.main" },
          { label: "Repetidas", valor: repetidas, cor: "warning.main" },
          { label: "Faltam", valor: faltam, cor: "error.main" },
          { label: "Total", valor: total, cor: "primary.main" },
        ].map(({ label, valor, cor }) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              alignItems: "center",
              justifyContent: "space-between",
              width: { xs: "100%", md: "auto" },
              gap: 0.25,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, lineHeight: 1, color: cor }}
            >
              {valor}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <LinearProgress
          variant="determinate"
          value={percentual}
          sx={{
            flex: 1,
            height: 10,
            borderRadius: 5,
            bgcolor: (t) => (t.palette.mode === "dark" ? "#242734" : "#e9ecef"),
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              background: "linear-gradient(90deg, #2563eb, #16a34a)",
              transition: "width 0.6s ease",
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          {percentual}% completo
        </Typography>
      </Box>
    </Paper>
  );
};

export default BarraProgresso;
