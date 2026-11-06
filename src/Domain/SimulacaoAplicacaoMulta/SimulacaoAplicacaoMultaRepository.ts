import { ISimulacaoAplicacaoMulta, StatusSimulacaoType } from './SimulacaoAplicacaoMulta';

export interface ICriarSimulacaoData {
  placaVeiculo: string;
  tipoMultaId: number;
  dataHoraCaptura?: Date;
  localCaptura: string;
  status?: StatusSimulacaoType;
  motivoRejeicao?: string | null;
}

export interface IAtualizarSimulacaoData {
  placaVeiculo?: string;
  tipoMultaId?: number;
  dataHoraCaptura?: Date;
  localCaptura?: string;
  status?: StatusSimulacaoType;
  motivoRejeicao?: string | null;
}

export interface SimulacaoAplicacaoMultaRepository {
  criar(dados: ICriarSimulacaoData): Promise<ISimulacaoAplicacaoMulta>;
  listar(): Promise<ISimulacaoAplicacaoMulta[]>;
  buscarPorId(id: number): Promise<ISimulacaoAplicacaoMulta | null>;
  atualizar(id: number, dados: IAtualizarSimulacaoData): Promise<ISimulacaoAplicacaoMulta>;
  excluir(id: number): Promise<void>;
}

