import { Cidadao } from './Cidadao';

export interface PaginacaoCidadao {
  /** Página baseada em 1. */
  pagina: number;
  /** Quantidade máxima de cidadãos por página. */
  limite: number;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  pagina: number;
  limite: number;
  total: number;
}

/** Contrato de persistência do domínio; não depende de HTTP nem de Prisma. */
export interface CidadaoRepository {
  salvar(cidadao: Cidadao): Promise<void>;
  buscarPorId(id: string): Promise<Cidadao | null>;
  buscarPorCpf(cpf: string): Promise<Cidadao | null>;
  buscarPorCnh(cnhNumero: string): Promise<Cidadao | null>;
  listar(paginacao: PaginacaoCidadao): Promise<ResultadoPaginado<Cidadao>>;
  excluir(id: string): Promise<void>;
}
