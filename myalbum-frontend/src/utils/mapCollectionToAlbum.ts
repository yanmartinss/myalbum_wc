import type { Album, EstadoFigurinha, Figurinha, FigurinhaEstado } from "../types";

export type CollectionStatus = "all" | "missing" | "owned" | "duplicates";

export const filtroParaStatus = (
  filtro: "todos" | "faltam" | "tenho" | "repetida",
): CollectionStatus => {
  const map = {
    todos: "all",
    faltam: "missing",
    tenho: "owned",
    repetida: "duplicates",
  } as const;
  return map[filtro];
};

export type CollectionItem = {
  code: string;
  country: string;
  group: string;
  quantidade: number;
};

export function quantidadeParaEstado(quantidade: number): EstadoFigurinha {
  if (quantidade > 1) return "repetida";
  if (quantidade === 1) return "tenho";
  return "faltam";
}

export function isApiCollection(data: unknown): data is CollectionItem[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "code" in item &&
        "quantidade" in item,
    )
  );
}

export type CollectionCounts = {
  all: number;
  missing: number;
  owned: number;
  duplicates: number;
};

export type CollectionResponse = {
  items: CollectionItem[];
  counts: CollectionCounts;
};

export function parseCollectionResponse(
  data: unknown,
): CollectionResponse | null {
  if (!data || typeof data !== "object") return null;

  const payload = data as Record<string, unknown>;

  // Formato: { items: [...], counts: { all, missing, owned, duplicates } }
  if (Array.isArray(payload.items)) {
    const counts = payload.counts;
    const parsedCounts: CollectionCounts = counts && typeof counts === "object"
      ? {
          all: Number((counts as Record<string, unknown>).all ?? 0),
          missing: Number((counts as Record<string, unknown>).missing ?? 0),
          owned: Number((counts as Record<string, unknown>).owned ?? 0),
          duplicates: Number((counts as Record<string, unknown>).duplicates ?? 0),
        }
      : { all: 0, missing: 0, owned: 0, duplicates: 0 };

    return {
      items: payload.items as CollectionItem[],
      counts: parsedCounts,
    };
  }

  return null;
}

export function mapCollectionItemToFigurinha(item: CollectionItem): Figurinha {
  return {
    numero: item.code,
    nome: item.code,
    grupo: item.group,
    tipo: "jogador",
    pais: item.country,
  };
}

export function naturalSort(a: string, b: string): number {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  return collator.compare(a, b);
}

export function getCollectionStats(items: CollectionItem[]): {
  total: number;
  tenho: number;
  repetidas: number;
  faltam: number;
  percentual: number;
} {
  const total = items.length;
  const tenho = items.filter((item) => item.quantidade === 1).length;
  const repetidas = items.filter((item) => item.quantidade > 1).length;
  const faltam = items.filter((item) => item.quantidade === 0).length;
  const percentual =
    total > 0 ? Math.round(((tenho + repetidas) / total) * 100) : 0;

  return { total, tenho, repetidas, faltam, percentual };
}

export function statsFromCounts(counts: CollectionCounts): {
  total: number;
  tenho: number;
  repetidas: number;
  faltam: number;
  percentual: number;
} {
  const total = counts.all;
  const tenho = counts.owned;
  const repetidas = counts.duplicates;
  const faltam = counts.missing;
  const percentual =
    total > 0 ? Math.round(((tenho + repetidas) / total) * 100) : 0;

  return { total, tenho, repetidas, faltam, percentual };
}

export function mapCollectionToAlbum(
  items: CollectionItem[],
  userEmail: string,
): Album {
  const figurinhas: Record<string, FigurinhaEstado> = {};

  for (const item of items) {
    figurinhas[item.code] = {
      estado: quantidadeParaEstado(item.quantidade),
      ultimaModificacao: Date.now(),
      modificadoPor: userEmail,
    };
  }

  return {
    albumId: "api",
    usuarios: [userEmail],
    figurinhas,
    historicoTrocas: [],
  };
}
