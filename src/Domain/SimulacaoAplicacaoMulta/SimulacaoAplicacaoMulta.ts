import { DadosSimulacaoInvalidosError } from './SimulacaoAplicacaoMultaErrors';

export type StatusSimulacaoType = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export interface ISimulacaoAplicacaoMulta {
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

export class SimulacaoAplicacaoMulta {
  constructor(
    public readonly id: number,
    public placaVeiculo: string,
    public tipoMultaId: number,
    public dataHoraCaptura: Date,
    public localCaptura: string,
    public status: StatusSimulacaoType,
    public motivoRejeicao: string | null,
    public readonly criadoEm: Date,
    public readonly atualizadoEm: Date
  ) {}

  public static validarPlaca(placa: string): string {
    if (!placa || typeof placa !== 'string') {
      throw new DadosSimulacaoInvalidosError('A placa do veículo é obrigatória e deve ser um texto válido.');
    }
    const placaLimpa = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (placaLimpa.length < 7 || placaLimpa.length > 8) {
      throw new DadosSimulacaoInvalidosError('A placa informada é inválida. Utilize um formato padrão ou Mercosul (ex: ABC1234 ou ABC1D23).');
    }
    return placaLimpa;
  }

  public static validarStatus(status: unknown): StatusSimulacaoType {
    const statusValidos: StatusSimulacaoType[] = ['PENDENTE', 'APROVADA', 'REJEITADA'];
    if (typeof status !== 'string' || !statusValidos.includes(status.toUpperCase() as StatusSimulacaoType)) {
      throw new DadosSimulacaoInvalidosError(`Status inválido. Valores aceitos: ${statusValidos.join(', ')}.`);
    }
    return status.toUpperCase() as StatusSimulacaoType;
  }
}


