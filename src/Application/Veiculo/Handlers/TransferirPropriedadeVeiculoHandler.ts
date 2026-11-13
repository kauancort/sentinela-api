import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import {
  ErroDadosVeiculoInvalidos,
  ErroProprietarioVeiculoNaoEncontrado,
  ErroVeiculoNaoEncontrado,
  propagarErroVeiculo
} from '../VeiculoApplicationErrors';
import { validarTransferirPropriedadeVeiculo } from '../../Validator/Veiculo/TransferirPropriedadeVeiculoValidator';
import type { TransferirPropriedadeVeiculoRequestDto } from '../DTOs/Requests/TransferirPropriedadeVeiculoRequestDto';
import type { VeiculoResponseDto } from '../DTOs/Responses/VeiculoResponseDto';
import { mapearVeiculoParaResponse } from '../DTOs/Responses/VeiculoResponseMapper';

export class TransferirPropriedadeVeiculoHandler {
  constructor(private readonly veiculos: VeiculoRepository) {}

  async execute(
    id: unknown,
    dto: TransferirPropriedadeVeiculoRequestDto
  ): Promise<VeiculoResponseDto> {
    const entrada = validarTransferirPropriedadeVeiculo(id, dto);
    const veiculo = await this.veiculos.buscarPorId(entrada.id);
    if (veiculo === null) throw new ErroVeiculoNaoEncontrado(entrada.id);

    const novoProprietarioId = entrada.dados.novoProprietarioId;
    if (veiculo.pertenceAo(novoProprietarioId)) {
      throw new ErroDadosVeiculoInvalidos(
        'novoProprietarioId',
        'O novo proprietário deve ser diferente do proprietário atual.'
      );
    }

    try {
      const proprietarioExiste = await this.veiculos.proprietarioExiste(novoProprietarioId);
      if (!proprietarioExiste) {
        throw new ErroProprietarioVeiculoNaoEncontrado(novoProprietarioId);
      }

      veiculo.transferirPropriedade(novoProprietarioId);
      await this.veiculos.salvar(veiculo);
      return mapearVeiculoParaResponse(veiculo);
    } catch (erro) {
      propagarErroVeiculo(erro);
    }
  }
}
