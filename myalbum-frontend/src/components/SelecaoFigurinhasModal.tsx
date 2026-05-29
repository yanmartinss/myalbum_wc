import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";
import { Check, Close, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { CollectionItem, naturalSort } from "../utils/mapCollectionToAlbum";
import { TODAS_FIGURINHAS } from "../data/figurinhas";

interface Props {
  open: boolean;
  onClose: () => void;
  items: CollectionItem[];
  selected: string[];
  onConfirm: (codes: string[]) => void;
  title: string;
  emptyMessage?: string;
}

const SelecaoFigurinhasModal: React.FC<Props> = ({
  open,
  onClose,
  items,
  selected,
  onConfirm,
  title,
  emptyMessage,
}) => {
  const [tempSelected, setTempSelected] = useState<string[]>(selected);
  const [paginaGrupo, setPaginaGrupo] = useState(1);

  const sorted = useMemo(
    () => [...items].sort((a, b) => naturalSort(a.code, b.code)),
    [items],
  );

  const grupos = useMemo(
    () => Array.from(new Set(sorted.map((i) => i.group))).sort(naturalSort),
    [sorted],
  );

  const grupoAtual = grupos[paginaGrupo - 1] ?? null;
  const totalPaginas = grupos.length;

  const filtrados = useMemo(
    () => (grupoAtual ? sorted.filter((i) => i.group === grupoAtual) : sorted),
    [sorted, grupoAtual],
  );

  const agrupados = useMemo(() => {
    if (filtrados.length === 0) return [];
    const gruposPais: { pais: string; items: CollectionItem[] }[] = [];
    let current = {
      pais: filtrados[0].country ?? "",
      items: [filtrados[0]],
    };
    for (let i = 1; i < filtrados.length; i++) {
      const item = filtrados[i];
      if ((item.country ?? "") !== current.pais) {
        gruposPais.push(current);
        current = { pais: item.country ?? "", items: [item] };
      } else {
        current.items.push(item);
      }
    }
    gruposPais.push(current);
    return gruposPais;
  }, [filtrados]);

  const getNome = (code: string) =>
    TODAS_FIGURINHAS.find((f) => f.numero === code)?.nome ?? code;

  const toggleItem = (code: string) => {
    setTempSelected((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code],
    );
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  const handleClose = () => {
    setTempSelected(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 8 }}>
        {title}
        <Chip
          label={`${tempSelected.length} selecionada${tempSelected.length !== 1 ? "s" : ""}`}
          size="small"
          color="primary"
          sx={{ ml: "auto", fontWeight: 600 }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 400 }}>
        {sorted.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
            {emptyMessage ?? "Nenhuma figurinha disponível."}
          </Typography>
        ) : (
          <>
            {totalPaginas > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="modal-grupo-label">Grupo</InputLabel>
                    <Select
                      labelId="modal-grupo-label"
                      value={grupoAtual ?? ""}
                      label="Grupo"
                      onChange={(e) => {
                        const idx = grupos.indexOf(e.target.value);
                        setPaginaGrupo(idx + 1);
                      }}
                    >
                      {grupos.map((g) => (
                        <MenuItem key={g} value={g}>
                          {g}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <IconButton
                    size="small"
                    onClick={() => setPaginaGrupo((p) => Math.max(1, p - 1))}
                    disabled={paginaGrupo <= 1}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {paginaGrupo} / {totalPaginas}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setPaginaGrupo((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaGrupo >= totalPaginas}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>

                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    if (tempSelected.length === filtrados.length) {
                      setTempSelected((prev) =>
                        prev.filter(
                          (c) => !filtrados.some((f) => f.code === c),
                        ),
                      );
                    } else {
                      const todos = filtrados.map((f) => f.code);
                      setTempSelected((prev) =>
                        Array.from(new Set([...prev, ...todos])),
                      );
                    }
                  }}
                >
                  {tempSelected.filter((c) => filtrados.some((f) => f.code === c)).length ===
                  filtrados.length
                    ? "Desmarcar página"
                    : "Marcar página"}
                </Button>
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {agrupados.map((grupo) => (
                <Box key={grupo.pais || "__no_country__"}>
                  {grupo.pais && (
                    <Typography
                      variant="overline"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        ml: 0.5,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      {grupo.pais}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 1,
                    }}
                  >
                    {grupo.items.map((item) => {
                      const isSelected = tempSelected.includes(item.code);
                      return (
                        <Box
                          key={item.code}
                          onClick={() => toggleItem(item.code)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            p: 0.75,
                            borderRadius: 1.5,
                            border: 2,
                            borderColor: isSelected
                              ? "primary.main"
                              : "divider",
                            bgcolor: isSelected
                              ? "primary.light"
                              : "background.default",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            "&:hover": {
                              borderColor: "primary.main",
                              opacity: 0.85,
                            },
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            sx={{ p: 0, "& .MuiSvgIcon-root": { fontSize: 18 } }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: "text.disabled",
                                display: "block",
                                lineHeight: 1.1,
                              }}
                            >
                              #{item.code}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                fontSize: "0.7rem",
                              }}
                            >
                              {getNome(item.code)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClose}
          sx={{ color: "text.secondary", borderColor: "divider" }}
        >
          <Close sx={{ fontSize: 18 }} /> Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={tempSelected.length === 0}
          sx={{ fontWeight: 700, gap: 0.5 }}
        >
          <Check sx={{ fontSize: 18 }} /> Confirmar ({tempSelected.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelecaoFigurinhasModal;
