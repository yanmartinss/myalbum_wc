export type EstadoFigurinha = 'faltam' | 'tenho' | 'repetida';

export interface Figurinha {
  numero: string;
  nome: string;
  grupo: string; // time, estádio, lenda, especial, etc.
  tipo: 'jogador' | 'time' | 'estadio' | 'especial' | 'lenda';
  pais?: string;
}

export interface FigurinhaEstado {
  estado: EstadoFigurinha;
  ultimaModificacao: number;
  modificadoPor: string;
}

export interface Album {
  albumId: string;
  usuarios: string[];
  figurinhas: Record<string, FigurinhaEstado>;
  historicoTrocas: Troca[];
}

export interface Troca {
  id: string;
  data: number;
  de: string;
  para: string;
  figurinhaDada: string;
  figurinhaRecebida: string;
}

export interface FigurinhaComEstado extends Figurinha {
  estado: EstadoFigurinha;
}
