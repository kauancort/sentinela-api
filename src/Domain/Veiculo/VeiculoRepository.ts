import { Veiculo } from './Veiculo';

export interface FiltrosVeiculo {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  cor?: string;
  proprietarioId?: string;
}

export interface PaginacaoVeiculo {
  /** Página baseada em 1. */
  pagina: number;
  /** Quantidade máxima de veículos por página. */
  limite: number;
  filtros?: FiltrosVeiculo;
}

export interface ResultadoPaginadoVeiculo {
  itens: Veiculo[];
  pagina: number;
  limite: number;
  total: number;
}

/** Contrato de persistência do domínio; não depende de HTTP nem de Prisma. */
export interface VeiculoRepository {
  salvar(veiculo: Veiculo): Promise<void>;
  buscarPorId(id: string): Promise<Veiculo | null>;
  buscarPorPlaca(placa: string): Promise<Veiculo | null>;
  listar(paginacao: PaginacaoVeiculo): Promise<ResultadoPaginadoVeiculo>;
  excluir(id: string): Promise<void>;
}
