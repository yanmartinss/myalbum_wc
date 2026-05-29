import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAlbumStore } from "../store/albumStore";
import { TODAS_FIGURINHAS } from "../data/figurinhas";
import Navbar from "../components/Navbar";
import SelecaoFigurinhasModal from "../components/SelecaoFigurinhasModal";
import api from "../services/api";
import {
  CheckCircle,
  Close,
  HighlightOff,
  People,
  Repeat,
  SwapHoriz,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { CollectionItem, parseCollectionResponse } from "../utils/mapCollectionToAlbum";

type FigurinhaResumo = {
  numero: string;
  nome: string;
  pais?: string;
  grupo: string;
};

type SelecaoModal = "giving" | "receiving" | null;

const Trocas: React.FC = () => {
  const { user } = useAuth();
  const { album, carregando: storeCarregando, escutarAlbum, proporTroca } = useAlbumStore();

  const token = localStorage.getItem("token");
  const usaApi = !!token;

  const [duplicates, setDuplicates] = useState<CollectionItem[]>([]);
  const [missing, setMissing] = useState<CollectionItem[]>([]);
  const [carregandoApi, setCarregandoApi] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const [givingCodes, setGivingCodes] = useState<string[]>([]);
  const [receivingCodes, setReceivingCodes] = useState<string[]>([]);
  const [modalAberto, setModalAberto] = useState<SelecaoModal>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // ---- API mode: load duplicates (giving) and missing (receiving) ----
  const carregarDados = useCallback(async () => {
    if (!usaApi) return;
    setCarregandoApi(true);
    try {
      const [dupRes, missRes] = await Promise.all([
        api.get("/user/collection", { params: { status: "duplicates" } }),
        api.get("/user/collection", { params: { status: "missing" } }),
      ]);
      const dupParsed = parseCollectionResponse(dupRes.data);
      const missParsed = parseCollectionResponse(missRes.data);
      if (dupParsed) setDuplicates(dupParsed.items);
      if (missParsed) setMissing(missParsed.items);
    } catch {
      setDuplicates([]);
      setMissing([]);
    } finally {
      setCarregandoApi(false);
    }
  }, [usaApi]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ---- Firestore mode ----
  useEffect(() => {
    if (user?.email && !usaApi) {
      const unsub = escutarAlbum(user.email);
      return unsub;
    }
  }, [user, usaApi, escutarAlbum]);

  // ---- Derived data ----
  const repetidas: FigurinhaResumo[] = useMemo(() => {
    if (usaApi) {
      return duplicates.map((i) => {
        const f = TODAS_FIGURINHAS.find((x) => x.numero === i.code);
        return { numero: i.code, nome: f?.nome ?? i.code, pais: f?.pais, grupo: i.group };
      });
    }
    if (!album) return [];
    return TODAS_FIGURINHAS.filter(
      (f) => album.figurinhas[f.numero]?.estado === "repetida",
    ).map((f) => ({ numero: f.numero, nome: f.nome, pais: f.pais, grupo: f.grupo }));
  }, [usaApi, duplicates, album]);

  const faltam: FigurinhaResumo[] = useMemo(() => {
    if (usaApi) {
      return missing.map((i) => {
        const f = TODAS_FIGURINHAS.find((x) => x.numero === i.code);
        return { numero: i.code, nome: f?.nome ?? i.code, pais: f?.pais, grupo: i.group };
      });
    }
    if (!album) return [];
    return TODAS_FIGURINHAS.filter(
      (f) => album.figurinhas[f.numero]?.estado === "faltam",
    ).map((f) => ({ numero: f.numero, nome: f.nome, pais: f.pais, grupo: f.grupo }));
  }, [usaApi, missing, album]);

  const outroUsuario = useMemo(() => {
    if (usaApi) return "";
    if (!album || !user) return "";
    return album.usuarios.find((u) => u !== user.email) ?? "";
  }, [usaApi, album, user]);

  const givingItems = useMemo(
    () =>
      duplicates.length > 0
        ? duplicates
        : [],
    [duplicates],
  );

  const receivingItems = useMemo(
    () =>
      missing.length > 0
        ? missing
        : [],
    [missing],
  );

  // ---- API Trade register ----
  const registrarTrocaApi = useCallback(
    async (giving: string[], receiving: string[]) => {
      if (!user?.email) return;
      const body = {
        giving: giving.map((code) => ({ code, quantidade: 1 })),
        receiving: receiving.map((code) => ({ code, quantidade: 1 })),
      };
      await api.post("/trade/register", body);
    },
    [user],
  );

  const handleConfirmar = async () => {
    if (givingCodes.length === 0 || receivingCodes.length === 0) return;
    setAtualizando(true);
    setErro(null);
    try {
      if (usaApi) {
        await registrarTrocaApi(givingCodes, receivingCodes);
      } else if (user?.email) {
        for (const dada of givingCodes) {
          for (const recebida of receivingCodes) {
            await proporTroca(dada, recebida, user.email, outroUsuario);
          }
        }
      }
      setSucesso(
        `Troca realizada! Deu ${givingCodes.length} figurinha${givingCodes.length > 1 ? "s" : ""} por ${receivingCodes.length}.`,
      );
      setGivingCodes([]);
      setReceivingCodes([]);
      if (usaApi) await carregarDados();
      setTimeout(() => setSucesso(null), 4000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response: { data: { error?: string } } }).response?.data?.error ?? "")
          : "";
      setErro(msg || "Erro ao registrar troca.");
    } finally {
      setAtualizando(false);
    }
  };

  const carregando = usaApi ? carregandoApi : storeCarregando;

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
        <Typography variant="body2">Carregando trocas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <SwapHoriz color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Central de Trocas
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Selecione as figurinhas repetidas que você quer dar e as que você quer receber
          </Typography>
        </Box>

        {sucesso && (
          <Alert severity="success" sx={{ mb: 2.5 }}>
            <CheckCircle fontSize="inherit" /> {sucesso}
          </Alert>
        )}

        {erro && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErro(null)}>
            {erro}
          </Alert>
        )}

        {!usaApi && outroUsuario && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "action.hover",
              borderRadius: 1,
              p: 1.5,
              mb: 2.5,
            }}
          >
            <People sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Compartilhando álbum com: <strong>{outroUsuario}</strong>
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          {/* ---- GIVING PANEL ---- */}
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Repeat color="warning" sx={{ fontSize: 20 }} />
              Minhas Repetidas ({repetidas.length})
            </Typography>

            {repetidas.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
                Nenhuma figurinha repetida ainda.
              </Typography>
            ) : (
              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setModalAberto("giving")}
                  sx={{ fontWeight: 600, gap: 1, py: 1.5 }}
                >
                  <SwapHoriz /> Selecionar repetidas
                </Button>

                {givingCodes.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {givingCodes.map((code) => {
                      const f = TODAS_FIGURINHAS.find((x) => x.numero === code);
                      return (
                        <Chip
                          key={code}
                          label={`#${code} ${f?.nome ?? ""}`}
                          size="small"
                          color="warning"
                          onDelete={() =>
                            setGivingCodes((prev) => prev.filter((c) => c !== code))
                          }
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}
          </Paper>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              alignSelf: "center",
            }}
          >
            <SwapHoriz sx={{ fontSize: 40 }} />
          </Box>

          {/* ---- RECEIVING PANEL ---- */}
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HighlightOff sx={{ fontSize: 20, color: "error.main" }} />
              Que Faltam no Álbum ({faltam.length})
            </Typography>

            {faltam.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
                Álbum completo! Sem figurinhas faltando.
              </Typography>
            ) : (
              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setModalAberto("receiving")}
                  sx={{ fontWeight: 600, gap: 1, py: 1.5 }}
                >
                  <SwapHoriz /> Selecionar desejadas
                </Button>

                {receivingCodes.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {receivingCodes.map((code) => {
                      const f = TODAS_FIGURINHAS.find((x) => x.numero === code);
                      return (
                        <Chip
                          key={code}
                          label={`#${code} ${f?.nome ?? ""}`}
                          size="small"
                          color="error"
                          onDelete={() =>
                            setReceivingCodes((prev) => prev.filter((c) => c !== code))
                          }
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>

        {/* ---- CONFIRM BAR ---- */}
        {givingCodes.length > 0 && receivingCodes.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2.5,
              flexWrap: "wrap",
              borderColor: "primary.main",
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Você dá: <strong>{givingCodes.length}</strong> figurinha{givingCodes.length > 1 ? "s" : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.5px", ml: 2 }}>
                Você recebe: <strong>{receivingCodes.length}</strong> figurinha{receivingCodes.length > 1 ? "s" : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.25 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirmar}
                disabled={atualizando}
                sx={{ fontWeight: 700, gap: 1, minWidth: 160 }}
              >
                {atualizando ? (
                  <CircularProgress size={18} sx={{ color: "inherit" }} />
                ) : (
                  <>
                    <CheckCircle /> Confirmar Troca
                  </>
                )}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setGivingCodes([]);
                  setReceivingCodes([]);
                }}
                sx={{
                  color: "text.secondary",
                  borderColor: "divider",
                  "&:hover": { borderColor: "error.main", color: "error.main" },
                }}
              >
                <Close /> Cancelar
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      {/* ---- MODALS ---- */}
      <SelecaoFigurinhasModal
        open={modalAberto === "giving"}
        onClose={() => setModalAberto(null)}
        items={givingItems}
        selected={givingCodes}
        onConfirm={(codes) => setGivingCodes(codes)}
        title="Selecionar figurinhas repetidas para dar"
        emptyMessage="Nenhuma figurinha repetida disponível."
      />

      <SelecaoFigurinhasModal
        open={modalAberto === "receiving"}
        onClose={() => setModalAberto(null)}
        items={receivingItems}
        selected={receivingCodes}
        onConfirm={(codes) => setReceivingCodes(codes)}
        title="Selecionar figurinhas que faltam para receber"
        emptyMessage="Nenhuma figurinha faltando."
      />
    </Box>
  );
};

export default Trocas;
