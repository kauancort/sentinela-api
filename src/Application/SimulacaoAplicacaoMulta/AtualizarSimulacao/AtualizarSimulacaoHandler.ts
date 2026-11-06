import {
  SimulacaoAplicacaoMulta,
  StatusSimulacaoType
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMulta';
import {
  DadosSimulacaoInvalidosError,
  SimulacaoNaoEncontradaError
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import {
  IAtualizarSimulacaoData,
  SimulacaoAplicacaoMultaRepository
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';
import { AtualizarSimulacaoRequestDTO } from './dto/AtualizarSimulacaoRequest.dto';
import { AtualizarSimulacaoResponseDTO } from './dto/AtualizarSimulacaoResponse.dto';

export class AtualizarSimulacaoHandler {
  constructor(private readonly repositorio: SimulacaoAplicacaoMultaRepository) {}

  public async executar(id: number, requisicao: AtualizarSimulacaoRequestDTO): Promise<AtualizarSimulacaoResponseDTO> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new DadosSimulacaoInvalidosError('Informe um identificador (ID) válido e maior que zero.');
    }

    if (!requisicao || Object.keys(requisicao).length === 0) {
      throw new DadosSimulacaoInvalidosError('Informe ao menos um campo para atualização.');
    }

    const existente = await this.repositorio.buscarPorId(id);
    if (!existente) {
      throw new SimulacaoNaoEncontradaError(id);
    }

    const dadosAtualizar: IAtualizarSimulacaoData = {};

    if (requisicao.placaVeiculo !== undefined) {
      dadosAtualizar.placaVeiculo = SimulacaoAplicacaoMulta.validarPlaca(requisicao.placaVeiculo);
    }

    if (requisicao.tipoMultaId !== undefined) {
      if (!Number.isInteger(requisicao.tipoMultaId) || requisicao.tipoMultaId <= 0) {
        throw new DadosSimulacaoInvalidosError('O identificador do tipo de multa deve ser um número inteiro positivo.');
      }
      dadosAtualizar.tipoMultaId = requisicao.tipoMultaId;
    }

    if (requisicao.localCaptura !== undefined) {
      if (typeof requisicao.localCaptura !== 'string' || requisicao.localCaptura.trim().length === 0) {
        throw new DadosSimulacaoInvalidosError('O local da captura não pode ser vazio.');
      }
      dadosAtualizar.localCaptura = requisicao.localCaptura.trim();
    }

    if (requisicao.dataHoraCaptura !== undefined) {
      const parsedDate = new Date(requisicao.dataHoraCaptura);
      if (isNaN(parsedDate.getTime())) {
        throw new DadosSimulacaoInvalidosError('Data e hora de captura inválidas.');
      }
      dadosAtualizar.dataHoraCaptura = parsedDate;
    }

    if (requisicao.status !== undefined) {
      dadosAtualizar.status = SimulacaoAplicacaoMulta.validarStatus(requisicao.status);
    }

    if (requisicao.motivoRejeicao !== undefined) {
      dadosAtualizar.motivoRejeicao = requisicao.motivoRejeicao?.trim() || null;
    }

    const atualizado = await this.repositorio.atualizar(id, dadosAtualizar);
    return atualizado;
  }
}

