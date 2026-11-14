import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import { validarProcurarPorPlaca } from '../../Validator/CameraTransito/ProcurarPorPlacaValidator';
import { ErroRegistroCameraTransitoNaoEncontrado, propagarErroCameraTransito } from '../CameraTransitoApplicationErrors';
import type { ProcurarPorPlacaResponseDto } from '../DTOs/Responses/ProcurarPorPlacaResponseDto';
import { mapearProcurarPorPlacaParaResponse } from '../DTOs/Responses/ProcurarPorPlacaResponseMapper';

export class ProcurarPorPlacaHandler {
  constructor(private readonly veiculos: VeiculoRepository, private readonly cidadaos: CidadaoRepository) {}

  async execute(consulta: unknown): Promise<ProcurarPorPlacaResponseDto> {
    try {
      const { placa } = validarProcurarPorPlaca(consulta);
      const veiculo = await this.veiculos.buscarPorPlaca(placa);
      if (!veiculo) throw new ErroRegistroCameraTransitoNaoEncontrado('placa', 'Veículo não encontrado.');
      const proprietario = await this.cidadaos.buscarPorId(veiculo.proprietarioId);
      if (!proprietario) throw new ErroRegistroCameraTransitoNaoEncontrado('proprietarioId', 'Proprietário não encontrado.');
      return mapearProcurarPorPlacaParaResponse(veiculo, proprietario);
    } catch (erro) {
      propagarErroCameraTransito(erro);
    }
  }
}
