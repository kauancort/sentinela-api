import type { GravidadeCatalogoMulta } from '../CatalogoMulta/CatalogoMulta';
import type { Multa, StatusMulta } from './Multa';

export interface FiltrosMulta {
  placa?: string;
  codigoCamera?: string;
  catalogoMultaId?: string;
  condutorId?: string;
  responsavelId?: string;
  status?: StatusMulta;
  gravidade?: GravidadeCatalogoMulta;
  dataInicial?: Date;
  dataFinal?: Date;
}

export interface PaginacaoMultas {
  pagina: number;
  limite: number;
  filtros?: FiltrosMulta;
}

export interface ResultadoListarMultas {
  itens: Multa[];
  total: number;
  pagina: number;
  limite: number;
}

export interface ConsultaHistoricoComputavel {
  responsavelId: string;
  inicioExclusivo: Date;
  fimInclusivo: Date;
}

export interface CameraTransitoRepository {
  /** Insere uma ocorrência nova; não reescreve snapshots nem atualiza multas existentes. */
  salvar(multa: Multa): Promise<void>;
  buscarPorId(id: string): Promise<Multa | null>;
  buscarPorOcorrenciaId(ocorrenciaId: string): Promise<Multa | null>;
  listar(paginacao: PaginacaoMultas): Promise<ResultadoListarMultas>;
  /** Sem paginação. Filtra elegibilidade estrutural; habilitação é avaliada no caso de uso/política. */
  consultarHistoricoComputavel(consulta: ConsultaHistoricoComputavel): Promise<Multa[]>;
  /** Cancelamento lógico e idempotente; ausência gera erro específico. */
  cancelar(id: string): Promise<void>;
}
