import { StatusSimulacaoType } from '../../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMulta';

export interface AtualizarSimulacaoResponseDTO {
  id: number;
  placaVeiculo: string;
  tipoMultaId: number;
  dataHoraCaptura: Date;
  localCaptura: string;
  status: StatusSimulacaoType;
  motivoRejeicao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

