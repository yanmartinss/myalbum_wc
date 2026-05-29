import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAlbumStore } from "../store/albumStore";
import { TODAS_FIGURINHAS } from "../data/figurinhas";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  ArrowForward,
  CheckCircle,
  History,
  Inbox,
  Repeat,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Pagination,
} from "@mui/material";

type TradeSticker = {
  code: string;
  quantidade: number;
  sticker: { code: string; country: string; group: string };
};

type TradeHistoryItem = {
  id: string;
  createdAt: string;
  giving: TradeSticker[];
  receiving: TradeSticker[];
};

const Historico: React.FC = () => {
  const { user } = useAuth();
  const { album, carregando: storeCarregando, escutarAlbum } = useAlbumStore();

  const token = localStorage.getItem("token");
  const usaApi = !!token;

  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [carregandoApi, setCarregandoApi] = useState(true);

  const carregarHistorico = useCallback(
    async (page: number) => {
      if (!usaApi) return;
      setCarregandoApi(true);
      try {
        const { data } = await api.get("/trade/history", {
          params: { page, limit: 10 },
        });
        setTradeHistory(data.items ?? []);
        setHistoryTotalPages(data.totalPages ?? 1);
      } catch {
        setTradeHistory([]);
        setHistoryTotalPages(0);
      } finally {
        setCarregandoApi(false);
      }
    },
    [usaApi],
  );

  useEffect(() => {
    if (usaApi) {
      carregarHistorico(1);
    } else if (user?.email) {
      const unsub = escutarAlbum(user.email);
      return unsub;
    }
  }, [usaApi, user, carregarHistorico, escutarAlbum]);

  const getNome = (numero: string) =>
    TODAS_FIGURINHAS.find((f) => f.numero === numero)?.nome ?? numero;

  const carregando = usaApi ? carregandoApi : storeCarregando;

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2, color: 'text.secondary' }}>
        <CircularProgress />
        <Typography variant="body2">Carregando histórico...</Typography>
      </Box>
    );
  }

  const historicoMock = album?.historicoTrocas
    ? [...album.historicoTrocas].sort((a, b) => b.data - a.data)
    : [];

  const temDados = usaApi ? tradeHistory.length > 0 : historicoMock.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 }, maxWidth: 900, width: '100%', mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <History color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Histórico de Trocas
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Todas as trocas realizadas no álbum compartilhado
          </Typography>
        </Box>

        {!temDados ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 10, textAlign: 'center' }}>
            <Inbox sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary">Nenhuma troca realizada ainda.</Typography>
            <Typography variant="body2" color="text.disabled">
              Vá até a aba Trocas para começar!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {usaApi
              ? tradeHistory.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{ p: 2.5, transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}
                  >
                    <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      {new Date(item.createdAt).toLocaleString("pt-BR")}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Repeat sx={{ fontSize: 12 }} />}
                          label="Deu"
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {item.giving.map((g) => (
                            <Chip
                              key={g.code}
                              label={`#${g.code} · ${g.sticker.country}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 12 }} />}
                          label="Recebeu"
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {item.receiving.map((r) => (
                            <Chip
                              key={r.code}
                              label={`#${r.code} · ${r.sticker.country}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))
              : historicoMock.map((troca) => (
                  <Paper
                    key={troca.id}
                    variant="outlined"
                    sx={{ p: 2.5, transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}
                  >
                    <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                      {new Date(troca.data).toLocaleString("pt-BR")}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, fontSize: '0.85rem' }}>
                        <Typography variant="body2" color="text.secondary">Usuário:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{troca.de}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
                          <Chip
                            icon={<Repeat sx={{ fontSize: 12 }} />}
                            label="Deu"
                            size="small"
                            variant="outlined"
                            color="warning"
                            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                          />
                          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700 }}>
                            #{troca.figurinhaDada}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getNome(troca.figurinhaDada)}
                          </Typography>
                        </Box>

                        <ArrowForward sx={{ color: 'primary.main', fontSize: 20 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: 12 }} />}
                            label="Recebeu"
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                          />
                          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700 }}>
                            #{troca.figurinhaRecebida}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getNome(troca.figurinhaRecebida)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}

            {usaApi && historyTotalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Pagination
                  count={historyTotalPages}
                  page={historyPage}
                  onChange={(_, page) => {
                    setHistoryPage(page);
                    carregarHistorico(page);
                  }}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Historico;
