import { StatusSimulacaoType } from '../../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMulta';

export interface AtualizarSimulacaoRequestDTO {
  placaVeiculo?: string;
  tipoMultaId?: number;
  dataHoraCaptura?: string | Date;
  localCaptura?: string;
  status?: StatusSimulacaoType;
  motivoRejeicao?: string | null;
}

