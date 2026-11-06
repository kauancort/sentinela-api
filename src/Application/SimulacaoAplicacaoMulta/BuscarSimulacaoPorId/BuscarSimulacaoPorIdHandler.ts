import {
  DadosSimulacaoInvalidosError,
  SimulacaoNaoEncontradaError
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import { SimulacaoAplicacaoMultaRepository } from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';
import { BuscarSimulacaoResponseDTO } from './dto/BuscarSimulacaoResponse.dto';

export class BuscarSimulacaoPorIdHandler {
  constructor(private readonly repositorio: SimulacaoAplicacaoMultaRepository) {}

  public async executar(id: number): Promise<BuscarSimulacaoResponseDTO> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new DadosSimulacaoInvalidosError('Informe um identificador (ID) válido e maior que zero.');
    }

    const simulacao = await this.repositorio.buscarPorId(id);
    if (!simulacao) {
      throw new SimulacaoNaoEncontradaError(id);
    }

    return simulacao;
  }
}

