import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAlbumStore } from "../store/albumStore";
import { TODAS_FIGURINHAS } from "../data/figurinhas";
import type { EstadoFigurinha } from "../types";
import CardFigurinha from "../components/CardFigurinha";
import BarraProgresso from "../components/BarraProgresso";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  CollectionCounts,
  CollectionItem,
  CollectionStatus,
  filtroParaStatus,
  mapCollectionItemToFigurinha,
  naturalSort,
  parseCollectionResponse,
  quantidadeParaEstado,
} from "../utils/mapCollectionToAlbum";
import BotaoCompartilhar from "../components/BotaoCompartilhar";
import {
  Apps,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  EmojiEvents,
  HighlightOff,
  Repeat,
  Search,
  Warning,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

type FiltroEstado = "todos" | EstadoFigurinha;

const FILTRO_CONFIG: Record<
  FiltroEstado,
  { icon: React.ReactNode; label: string }
> = {
  todos: { icon: <Apps sx={{ fontSize: 16 }} />, label: "Todos" },
  faltam: { icon: <HighlightOff sx={{ fontSize: 16 }} />, label: "Faltam" },
  tenho: { icon: <CheckCircle sx={{ fontSize: 16 }} />, label: "Tenho" },
  repetida: { icon: <Repeat sx={{ fontSize: 16 }} />, label: "Repetidas" },
};

const COR_FILTRO: Record<FiltroEstado, string> = {
  todos: "primary.main",
  faltam: "error.main",
  tenho: "success.main",
  repetida: "warning.main",
};

export const Album = () => {
  const { user } = useAuth();
  const {
    album: storeAlbum,
    carregando: storeCarregando,
    escutarAlbum,
  } = useAlbumStore();

  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [collectionCounts, setCollectionCounts] =
    useState<CollectionCounts | null>(null);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [paginaGrupo, setPaginaGrupo] = useState(1);
  const [carregandoApi, setCarregandoApi] = useState(true);
  const [atualizandoLista, setAtualizandoLista] = useState(false);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  const modoBusca = buscaDebounced.length > 0;
  const token = localStorage.getItem("token");
  const usaApi = !!token;

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca.trim()), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const storeItems = useMemo<CollectionItem[]>(() => {
    if (!storeAlbum || usaApi) return [];
    return TODAS_FIGURINHAS.map((f) => {
      const estado = storeAlbum.figurinhas[f.numero]?.estado ?? "faltam";
      return {
        code: f.numero,
        country: f.pais ?? "",
        group: f.grupo,
        quantidade: estado === "repetida" ? 2 : estado === "tenho" ? 1 : 0,
      };
    });
  }, [storeAlbum, usaApi]);

  // Define display data
  const exibirCollection = usaApi ? collection : storeItems;
  const exibirGrupos = usaApi
    ? grupos
    : storeItems.length > 0
      ? Array.from(new Set(storeItems.map((i) => i.group)))
      : [];
  const grupoAtual = exibirGrupos[paginaGrupo - 1] ?? null;
  const totalPaginas = exibirGrupos.length;
  const carregando = usaApi ? carregandoApi : storeCarregando;
  const erro = erroApi;

  // Groups sorted alphabetically for the select dropdown
  const gruposOrdenados = useMemo(
    () => [...exibirGrupos].sort(naturalSort),
    [exibirGrupos],
  );

  // Collection sorted by natural code order
  const collectionOrdenada = useMemo(
    () => [...exibirCollection].sort((a, b) => naturalSort(a.code, b.code)),
    [exibirCollection],
  );

  // Group consecutive items by country for headers
  const colecaoAgrupada = useMemo(() => {
    if (collectionOrdenada.length === 0) return [];
    const grupos: { pais: string; items: CollectionItem[] }[] = [];
    let current = {
      pais: collectionOrdenada[0].country ?? "",
      items: [collectionOrdenada[0]],
    };
    for (let i = 1; i < collectionOrdenada.length; i++) {
      const item = collectionOrdenada[i];
      if ((item.country ?? "") !== current.pais) {
        grupos.push(current);
        current = { pais: item.country ?? "", items: [item] };
      } else {
        current.items.push(item);
      }
    }
    grupos.push(current);
    return grupos;
  }, [collectionOrdenada]);

  const carregarGrupos = useCallback(async () => {
    if (!usaApi) return;
    try {
      const { data } = await api.get("/user/collection/groups");
      if (Array.isArray(data.groups) && data.groups.length > 0) {
        setGrupos(data.groups);
      }
    } catch {
      // se falhar, tenta extrair dos items
    }
  }, [usaApi]);

  const buscarCollection = useCallback(
    async (
      status: CollectionStatus,
      target: "list" | "stats",
      filters?: { group?: string; search?: string },
    ) => {
      if (!usaApi) return null;

      const params: Record<string, string> = { status };
      if (filters?.group) params.group = filters.group;
      if (filters?.search) params.search = filters.search;

      try {
        const { data } = await api.get("/user/collection", { params });
        const parsed = parseCollectionResponse(data);

        if (!parsed) {
          if (target === "list") setCollection([]);
          console.warn("Resposta inesperada da API /user/collection:", data);
          return null;
        }

        if (target === "list") {
          setCollection(parsed.items);
        }

        if (target === "stats" && parsed.counts.all > 0) {
          setCollectionCounts(parsed.counts);
        }

        return parsed;
      } catch (err) {
        console.warn("Erro ao buscar coleção da API:", err);
        if (target === "list") setCollection([]);
        return null;
      }
    },
    [usaApi],
  );

  useEffect(() => {
    if (user?.email) {
      const unsub = escutarAlbum(user.email);
      return unsub;
    }
  }, [user, escutarAlbum]);

  // Init: load groups + stats
  useEffect(() => {
    if (!user?.email) return;

    const inicializar = async () => {
      if (usaApi) {
        setCarregandoApi(true);
        await Promise.all([carregarGrupos(), buscarCollection("all", "stats")]);
        setCarregandoApi(false);
      } else {
        setCarregandoApi(false);
      }
    };

    inicializar();
  }, [user, usaApi, buscarCollection, carregarGrupos]);

  // Load list when group/filter/search changes
  useEffect(() => {
    if (usaApi && user?.email && !carregandoApi && totalPaginas > 0) {
      const carregarLista = async () => {
        setAtualizandoLista(true);
        await buscarCollection(filtroParaStatus(filtroEstado), "list", {
          group: modoBusca ? undefined : (grupoAtual ?? undefined),
          search: buscaDebounced || undefined,
        });
        setAtualizandoLista(false);
      };
      carregarLista();
    }
  }, [
    usaApi,
    user,
    filtroEstado,
    paginaGrupo,
    grupoAtual,
    buscaDebounced,
    modoBusca,
    buscarCollection,
    carregandoApi,
    totalPaginas,
  ]);

  const atualizarColecoes = useCallback(async () => {
    if (usaApi) {
      setAtualizandoLista(true);
      await Promise.all([
        buscarCollection("all", "stats"),
        buscarCollection(filtroParaStatus(filtroEstado), "list", {
          group: modoBusca ? undefined : (grupoAtual ?? undefined),
          search: buscaDebounced || undefined,
        }),
      ]);
      setAtualizandoLista(false);
    }
  }, [
    usaApi,
    buscarCollection,
    filtroEstado,
    grupoAtual,
    buscaDebounced,
    modoBusca,
  ]);

  const userIdFromToken = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId ?? "";
    } catch {
      return "";
    }
  }, []);

  if (carregando) {
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
        <Typography variant="body2">Carregando álbum...</Typography>
      </Box>
    );
  }

  if (erro && exibirCollection.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 1.5,
          color: "error.main",
        }}
      >
        <Warning />
        <Typography>{erro}</Typography>
      </Box>
    );
  }

  const handleEstadoChange = (
    _: React.MouseEvent<HTMLElement>,
    novo: FiltroEstado | null,
  ) => {
    if (novo) setFiltroEstado(novo);
  };

  const irParaPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaGrupo(pagina);
  };

  const irParaGrupo = (grupo: string) => {
    const index = exibirGrupos.indexOf(grupo);
    if (index !== -1) setPaginaGrupo(index + 1);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

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
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
          >
            <EmojiEvents color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Álbum Copa do Mundo 2026
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Navegue página a página por grupo, como no álbum físico
          </Typography>
        </Box>

        <BarraProgresso
          collection={usaApi ? undefined : exibirCollection}
          counts={collectionCounts ?? undefined}
        />

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
              placeholder="Buscar em todo o álbum..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
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

            <ToggleButtonGroup
              value={filtroEstado}
              exclusive
              onChange={handleEstadoChange}
              size="small"
              disabled={atualizandoLista}
              sx={{ flexWrap: "wrap", gap: 0.5 }}
            >
              {(
                Object.entries(FILTRO_CONFIG) as [
                  FiltroEstado,
                  (typeof FILTRO_CONFIG)["todos"],
                ][]
              ).map(([key, { icon, label }]) => (
                <ToggleButton
                  key={key}
                  value={key}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.82rem",
                    gap: 0.5,
                    border: 1,
                    borderColor: "divider",
                    "&.Mui-selected": {
                      bgcolor: COR_FILTRO[key],
                      color: "#fff",
                      "&:hover": { bgcolor: COR_FILTRO[key] },
                    },
                  }}
                >
                  {icon} {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {!modoBusca && totalPaginas > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                pt: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flex: "0 1 auto",
                }}
              >
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="grupo-select-label">Grupo</InputLabel>
                  <Select
                    labelId="grupo-select-label"
                    value={grupoAtual ?? ""}
                    label="Grupo"
                    onChange={(e) => irParaGrupo(e.target.value)}
                    disabled={atualizandoLista}
                  >
                    {gruposOrdenados.map((g) => (
                      <MenuItem key={g} value={g}>
                        {g}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => irParaPagina(paginaGrupo - 1)}
                    disabled={paginaGrupo <= 1 || atualizandoLista}
                    aria-label="Página anterior"
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
                      {paginaGrupo} / {totalPaginas}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => irParaPagina(paginaGrupo + 1)}
                    disabled={paginaGrupo >= totalPaginas || atualizandoLista}
                    aria-label="Próxima página"
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}

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
            {atualizandoLista
              ? "Atualizando..."
              : `${collectionOrdenada.length} figurinha${collectionOrdenada.length !== 1 ? "s" : ""}`}
          </Typography>
        </Paper>

        {collectionOrdenada.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 10,
            }}
          >
            <Search sx={{ fontSize: 48, color: "text.disabled" }} />
            <Typography color="text.secondary">
              Nenhuma figurinha encontrada nesta página com esses filtros.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {colecaoAgrupada.map((grupo) => (
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
                      letterSpacing: "0.5px",
                    }}
                  >
                    {grupo.pais}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 1.5,
                  }}
                >
                  {grupo.items.map((item) => (
                    <CardFigurinha
                      key={item.code}
                      figurinha={mapCollectionItemToFigurinha(item)}
                      estado={quantidadeParaEstado(item.quantidade)}
                      quantidade={item.quantidade}
                      onUpdated={atualizarColecoes}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {userIdFromToken && <BotaoCompartilhar userId={userIdFromToken} />}
    </Box>
  );
};
