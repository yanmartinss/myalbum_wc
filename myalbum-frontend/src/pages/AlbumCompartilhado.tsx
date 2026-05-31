import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useTema } from "../contexts/TemaContext";
import {
  quantidadeParaEstado,
  naturalSort,
} from "../utils/mapCollectionToAlbum";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DarkMode,
  EmojiEvents,
  HighlightOff,
  LightMode,
  Person,
  Repeat,
  Search,
} from "@mui/icons-material";

type SharedItem = {
  code: string;
  country: string;
  group: string;
  quantidade: number;
};

type SharedAlbumCounts = {
  all: number;
  owned: number;
  missing: number;
  duplicates: number;
};

type SharedAlbumResponse = {
  userName: string;
  items: SharedItem[];
  counts: SharedAlbumCounts;
  groups: string[];
  totalPages: number;
  currentPage: number;
};

const COR_ESTADO: Record<string, { bg: string; main: string }> = {
  faltam: { bg: "error.light", main: "error.main" },
  tenho: { bg: "success.light", main: "success.main" },
  repetida: { bg: "warning.light", main: "warning.main" },
};

const LABEL_ESTADO: Record<string, string> = {
  faltam: "Falta",
  tenho: "Tenho",
  repetida: "Repetida",
};

const ICONE_ESTADO: Record<string, React.ReactElement> = {
  faltam: <HighlightOff sx={{ fontSize: 14 }} />,
  tenho: <CheckCircle sx={{ fontSize: 14 }} />,
  repetida: <Repeat sx={{ fontSize: 14 }} />,
};

const AlbumCompartilhado: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { mode, toggleTema } = useTema();

  const [data, setData] = useState<SharedAlbumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [indiceGrupo, setIndiceGrupo] = useState(-1);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  const modoBusca = buscaDebounced.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca.trim()), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const grupos = data?.groups ?? [];
  const grupoAtual = modoBusca ? null : (grupos[indiceGrupo] ?? null);
  const totalPaginas = grupos.length;

  const fetchSharedAlbum = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (grupoAtual) {
        params.group = grupoAtual;
        params.limit = "200";
      }
      if (buscaDebounced) params.search = buscaDebounced;

      const { data: response } = await api.get(`/album/shared/${userId}`, {
        params,
      });
      setData(response);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("Coleção não encontrada ou usuário não existe.");
      } else {
        setError("Erro ao carregar álbum compartilhado.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, grupoAtual, buscaDebounced]);

  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (indiceGrupo === -1 && !fetchedOnce.current) {
      fetchedOnce.current = true;
      fetchSharedAlbum();
    }
  }, [indiceGrupo, fetchSharedAlbum]);

  useEffect(() => {
    if (data && indiceGrupo === -1 && data.groups.length > 0) {
      setIndiceGrupo(0);
    }
  }, [data, indiceGrupo]);

  useEffect(() => {
    if (indiceGrupo >= 0) {
      fetchSharedAlbum();
    }
  }, [indiceGrupo, grupoAtual]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fetchedOnce.current) {
      fetchSharedAlbum();
    }
  }, [buscaDebounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const colecaoPorGrupo = useMemo(() => {
    const itens = data?.items;
    const groups = data?.groups ?? [];
    if (!itens || itens.length === 0) return [];

    const groupOrder = new Map(groups.map((g, i) => [g, i]));

    const sorted = [...itens].sort((a, b) => {
      const ga = groupOrder.get(a.group) ?? 999;
      const gb = groupOrder.get(b.group) ?? 999;
      if (ga !== gb) return ga - gb;
      return naturalSort(a.code, b.code);
    });

    type GrupoAgrupado = {
      group: string;
      paises: { pais: string; items: SharedItem[] }[];
    };
    const grupos: GrupoAgrupado[] = [];
    let grupoAtualObj: GrupoAgrupado | null = null;
    let paisAtual: { pais: string; items: SharedItem[] } | null = null;
    for (const item of sorted) {
      if (!grupoAtualObj || item.group !== grupoAtualObj.group) {
        paisAtual = { pais: item.country ?? "", items: [item] };
        grupoAtualObj = { group: item.group, paises: [paisAtual] };
        grupos.push(grupoAtualObj);
      } else if ((item.country ?? "") !== (paisAtual?.pais ?? "")) {
        paisAtual = { pais: item.country ?? "", items: [item] };
        grupoAtualObj.paises.push(paisAtual);
      } else {
        paisAtual?.items.push(item);
      }
    }
    return grupos;
  }, [data?.items, data?.groups]);

  const irParaPagina = useCallback(
    (pagina: number) => {
      if (pagina < 0 || pagina >= totalPaginas) return;
      setIndiceGrupo(pagina);
    },
    [totalPaginas],
  );

  const irParaGrupo = useCallback(
    (grupo: string) => {
      const idx = grupos.indexOf(grupo);
      if (idx !== -1) setIndiceGrupo(idx);
    },
    [grupos],
  );

  if (loading && !data) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
          color: "text.secondary",
        }}
      >
        <CircularProgress />
        <Typography variant="body2">
          Carregando álbum compartilhado...
        </Typography>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
          color: "error.main",
          p: 4,
          textAlign: "center",
        }}
      >
        <HighlightOff sx={{ fontSize: 48 }} />
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!data) return null;

  const { userName, items, counts } = data;
  const percentual =
    counts.all > 0 ? Math.round((counts.owned / counts.all) * 100) : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1600,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar sx={{ bgcolor: "primary.dark", width: 48, height: 48 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {userName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Álbum compartilhado · {counts.all} figurinhas
            </Typography>
          </Box>
          <IconButton
            onClick={toggleTema}
            sx={{ ml: "auto", color: "primary.contrastText" }}
          >
            {mode === "dark" ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          maxWidth: 1600,
          width: "100%",
          mx: "auto",
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            <EmojiEvents sx={{ verticalAlign: "middle", mr: 1 }} />
            {counts.owned} de {counts.all} figurinhas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {percentual}% completo · {counts.missing} faltam
            {counts.duplicates > 0 && ` · ${counts.duplicates} repetidas`}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="Buscar no álbum..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
              }}
              size="small"
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 240px" }, minWidth: 220 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "text.disabled", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {!modoBusca && totalPaginas > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: "0 1 auto",
                }}
              >
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="grupo-label">Grupo</InputLabel>
                  <Select
                    labelId="grupo-label"
                    value={grupoAtual ?? ""}
                    label="Grupo"
                    onChange={(e) => irParaGrupo(e.target.value)}
                  >
                    {grupos.map((g) => (
                      <MenuItem key={g} value={g}>
                        {g}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => irParaPagina(indiceGrupo - 1)}
                    disabled={indiceGrupo <= 0}
                    aria-label="Grupo anterior"
                  >
                    <ChevronLeft />
                  </IconButton>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {grupoAtual}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {indiceGrupo + 1} / {totalPaginas}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => irParaPagina(indiceGrupo + 1)}
                    disabled={indiceGrupo >= totalPaginas - 1}
                    aria-label="Próximo grupo"
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>

          {modoBusca && (
            <Typography variant="body2" color="text.secondary">
              Mostrando resultados da busca em todo o álbum
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ alignSelf: "flex-end" }}
          >
            {loading
              ? "Carregando..."
              : `${items.length} figurinha${items.length !== 1 ? "s" : ""}`}
          </Typography>
        </Paper>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && items.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10, color: "text.secondary" }}>
            <Search sx={{ fontSize: 48, mb: 1 }} />
            <Typography>Nenhuma figurinha encontrada.</Typography>
          </Box>
        )}

        {!loading && items.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {colecaoPorGrupo.map((grupo) => (
              <Box key={grupo.group}>
                {modoBusca && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: "primary.main",
                      borderBottom: 2,
                      borderColor: "divider",
                      pb: 0.5,
                    }}
                  >
                    {grupo.group}
                  </Typography>
                )}
                {grupo.paises.map((pais) => (
                  <Box key={pais.pais || "__no_country__"}>
                    {pais.pais && (
                      <Typography
                        variant="overline"
                        sx={{
                          display: "block",
                          mb: 0.5,
                          ml: 0.5,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {pais.pais}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      {pais.items.map((item) => {
                        const estado = quantidadeParaEstado(item.quantidade);
                        const cor = COR_ESTADO[estado];
                        return (
                          <Paper
                            key={item.code}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5,
                              textAlign: "center",
                              minHeight: 120,
                              justifyContent: "center",
                              borderColor: cor.bg,
                              bgcolor: cor.bg,
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: 1,
                                borderColor: cor.main,
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
                              {item.code}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: "text.primary",
                                lineHeight: 1.3,
                              }}
                            >
                              {item.group}
                            </Typography>
                            {item.country && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem" }}
                              >
                                {item.country}
                              </Typography>
                            )}
                            <Chip
                              icon={ICONE_ESTADO[estado]}
                              label={`${LABEL_ESTADO[estado]} · ${item.quantidade}`}
                              size="small"
                              sx={{
                                mt: 0.5,
                                fontWeight: 600,
                                fontSize: "0.72rem",
                                bgcolor: cor.bg,
                                color: cor.main,
                                height: 24,
                              }}
                            />
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AlbumCompartilhado;
