import {
  DadosSimulacaoInvalidosError,
  SimulacaoNaoEncontradaError
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import { SimulacaoAplicacaoMultaRepository } from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';

export class ExcluirSimulacaoHandler {
  constructor(private readonly repositorio: SimulacaoAplicacaoMultaRepository) {}

  public async executar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new DadosSimulacaoInvalidosError('Informe um identificador (ID) válido e maior que zero.');
    }

    const existente = await this.repositorio.buscarPorId(id);
    if (!existente) {
      throw new SimulacaoNaoEncontradaError(id);
    }

    await this.repositorio.excluir(id);
  }
}

