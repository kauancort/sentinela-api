import { SimulacaoAplicacaoMulta } from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMulta';
import { DadosSimulacaoInvalidosError } from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import { SimulacaoAplicacaoMultaRepository } from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';
import { CriarSimulacaoRequestDTO } from './dto/CriarSimulacaoRequest.dto';
import { CriarSimulacaoResponseDTO } from './dto/CriarSimulacaoResponse.dto';

export class CriarSimulacaoHandler {
  constructor(private readonly repositorio: SimulacaoAplicacaoMultaRepository) {}

  public async executar(requisicao: CriarSimulacaoRequestDTO): Promise<CriarSimulacaoResponseDTO> {
    if (!requisicao) {
      throw new DadosSimulacaoInvalidosError('Dados da simulação não informados.');
    }

    const placaFormatada = SimulacaoAplicacaoMulta.validarPlaca(requisicao.placaVeiculo);

    if (!requisicao.tipoMultaId || !Number.isInteger(requisicao.tipoMultaId) || requisicao.tipoMultaId <= 0) {
      throw new DadosSimulacaoInvalidosError('O identificador do tipo de multa (tipoMultaId) deve ser um número inteiro positivo.');
    }

    if (!requisicao.localCaptura || typeof requisicao.localCaptura !== 'string' || requisicao.localCaptura.trim().length === 0) {
      throw new DadosSimulacaoInvalidosError('O local da captura é obrigatório.');
    }

    let dataHoraCaptura: Date | undefined;
    if (requisicao.dataHoraCaptura) {
      const parsedDate = new Date(requisicao.dataHoraCaptura);
      if (isNaN(parsedDate.getTime())) {
        throw new DadosSimulacaoInvalidosError('Data e hora de captura inválidas.');
      }
      dataHoraCaptura = parsedDate;
    }

    const status = requisicao.status ? SimulacaoAplicacaoMulta.validarStatus(requisicao.status) : 'PENDENTE';

    const simulacaoCriada = await this.repositorio.criar({
      placaVeiculo: placaFormatada,
      tipoMultaId: requisicao.tipoMultaId,
      dataHoraCaptura,
      localCaptura: requisicao.localCaptura.trim(),
      status,
      motivoRejeicao: requisicao.motivoRejeicao?.trim() || null
    });

    return simulacaoCriada;
  }
}

