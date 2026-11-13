import { CatalogoMulta, GravidadeCatalogoMulta, ResponsabilidadeCatalogoMulta } from './CatalogoMulta';

export interface FiltrosCatalogoMulta {
  codigo?: string;
  descricao?: string;
  gravidade?: GravidadeCatalogoMulta;
  responsabilidade?: ResponsabilidadeCatalogoMulta;
  ativo?: boolean;
}

export interface PaginacaoCatalogoMulta {
  pagina: number;
  limite: number;
  filtros?: FiltrosCatalogoMulta;
}

export interface ResultadoPaginadoCatalogoMulta {
  itens: CatalogoMulta[];
  pagina: number;
  limite: number;
  total: number;
}

export interface CatalogoMultaRepository {
  salvar(catalogoMulta: CatalogoMulta): Promise<void>;
  buscarPorId(id: string): Promise<CatalogoMulta | null>;
  buscarPorCodigo(codigo: string): Promise<CatalogoMulta | null>;
  listar(paginacao: PaginacaoCatalogoMulta): Promise<ResultadoPaginadoCatalogoMulta>;
  excluir(id: string): Promise<void>;
}
