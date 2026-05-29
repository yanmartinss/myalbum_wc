import { create } from "zustand";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Album, EstadoFigurinha, FigurinhaEstado, Troca } from "../types";
import { TODAS_FIGURINHAS } from "../data/figurinhas";
import { db } from "../firebase/config";

// Set to true to bypass Firestore completely and run 100% locally with localStorage
// This avoids any network/adblocker blocks (ERR_BLOCKED_BY_CLIENT) on firestore.googleapis.com
const USE_LOCAL_MOCK = false;

const ALBUM_ID = "copa2026";

interface AlbumStore {
  album: Album | null;
  carregando: boolean;
  erro: string | null;
  escutarAlbum: (userEmail: string) => () => void;
  atualizarEstado: (
    numero: string,
    novoEstado: EstadoFigurinha,
    userEmail: string,
  ) => Promise<void>;
  proporTroca: (
    figurinhaDada: string,
    figurinhaRecebida: string,
    userEmail: string,
    outroUsuario: string,
  ) => Promise<void>;
}

// Helper to initialize local album state
function obterAlbumMockInicial(userEmail: string): Album {
  const figurinhasIniciais: Record<string, FigurinhaEstado> = {};
  TODAS_FIGURINHAS.forEach((f) => {
    figurinhasIniciais[f.numero] = {
      estado: "faltam",
      ultimaModificacao: Date.now(),
      modificadoPor: userEmail,
    };
  });
  return {
    albumId: ALBUM_ID,
    usuarios: [userEmail, "usuario2@email.com"], // Default two users
    figurinhas: figurinhasIniciais,
    historicoTrocas: [],
  };
}

// Inicializa o álbum se não existir (para o Firebase)
async function inicializarAlbum(userEmail: string) {
  const ref = doc(db, "albuns", ALBUM_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const figurinhasIniciais: Record<string, FigurinhaEstado> = {};
    TODAS_FIGURINHAS.forEach((f) => {
      figurinhasIniciais[f.numero] = {
        estado: "faltam",
        ultimaModificacao: Date.now(),
        modificadoPor: userEmail,
      };
    });

    await setDoc(ref, {
      albumId: ALBUM_ID,
      usuarios: [userEmail],
      figurinhas: figurinhasIniciais,
      historicoTrocas: [],
    });
  } else {
    // Adiciona o usuário se não estiver na lista
    const data = snap.data() as Album;
    if (!data.usuarios.includes(userEmail)) {
      await updateDoc(ref, {
        usuarios: arrayUnion(userEmail),
      });
    }
  }
}

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  album: null,
  carregando: true,
  erro: null,

  escutarAlbum: (userEmail: string) => {
    if (USE_LOCAL_MOCK) {
      const albumSalvo = localStorage.getItem(`album_${ALBUM_ID}`);
      let albumData: Album;

      if (albumSalvo) {
        albumData = JSON.parse(albumSalvo);
        // Garante que o usuário atual esteja na lista
        if (!albumData.usuarios.includes(userEmail)) {
          albumData.usuarios.push(userEmail);
          localStorage.setItem(`album_${ALBUM_ID}`, JSON.stringify(albumData));
        }
      } else {
        albumData = obterAlbumMockInicial(userEmail);
        localStorage.setItem(`album_${ALBUM_ID}`, JSON.stringify(albumData));
      }

      set({ album: albumData, carregando: false });

      // Retorna uma função vazia para simular o unsubscribe
      return () => {};
    }

    const ref = doc(db, "albuns", ALBUM_ID);

    // Inicializa e escuta em tempo real
    inicializarAlbum(userEmail).catch((err) => {
      set({ erro: err.message, carregando: false });
    });

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          set({ album: snap.data() as Album, carregando: false });
        }
      },
      (err) => {
        set({ erro: err.message, carregando: false });
      },
    );

    return unsubscribe;
  },

  atualizarEstado: async (
    numero: string,
    novoEstado: EstadoFigurinha,
    userEmail: string,
  ) => {
    if (USE_LOCAL_MOCK) {
      const albumAtual = get().album;
      if (!albumAtual) return;

      const novoAlbum = {
        ...albumAtual,
        figurinhas: {
          ...albumAtual.figurinhas,
          [numero]: {
            estado: novoEstado,
            ultimaModificacao: Date.now(),
            modificadoPor: userEmail,
          },
        },
      };

      localStorage.setItem(`album_${ALBUM_ID}`, JSON.stringify(novoAlbum));
      set({ album: novoAlbum });
      return;
    }

    const ref = doc(db, "albuns", ALBUM_ID);
    await updateDoc(ref, {
      [`figurinhas.${numero}`]: {
        estado: novoEstado,
        ultimaModificacao: Date.now(),
        modificadoPor: userEmail,
      },
    });
  },

  proporTroca: async (
    figurinhaDada: string,
    figurinhaRecebida: string,
    userEmail: string,
    outroUsuario: string,
  ) => {
    if (USE_LOCAL_MOCK) {
      const albumAtual = get().album;
      if (!albumAtual) return;

      const troca: Troca = {
        id: crypto.randomUUID(),
        data: Date.now(),
        de: userEmail,
        para: outroUsuario || "usuario2@email.com",
        figurinhaDada,
        figurinhaRecebida,
      };

      const novoAlbum: Album = {
        ...albumAtual,
        figurinhas: {
          ...albumAtual.figurinhas,
          [figurinhaDada]: {
            estado: "faltam",
            ultimaModificacao: Date.now(),
            modificadoPor: userEmail,
          },
          [figurinhaRecebida]: {
            estado: "tenho",
            ultimaModificacao: Date.now(),
            modificadoPor: userEmail,
          },
        },
        historicoTrocas: [...albumAtual.historicoTrocas, troca],
      };

      localStorage.setItem(`album_${ALBUM_ID}`, JSON.stringify(novoAlbum));
      set({ album: novoAlbum });
      return;
    }

    const ref = doc(db, "albuns", ALBUM_ID);
    const troca: Troca = {
      id: crypto.randomUUID(),
      data: Date.now(),
      de: userEmail,
      para: outroUsuario,
      figurinhaDada,
      figurinhaRecebida,
    };

    await updateDoc(ref, {
      [`figurinhas.${figurinhaDada}`]: {
        estado: "faltam",
        ultimaModificacao: Date.now(),
        modificadoPor: userEmail,
      },
      [`figurinhas.${figurinhaRecebida}`]: {
        estado: "tenho",
        ultimaModificacao: Date.now(),
        modificadoPor: userEmail,
      },
      historicoTrocas: arrayUnion(troca),
    });
  },
}));
