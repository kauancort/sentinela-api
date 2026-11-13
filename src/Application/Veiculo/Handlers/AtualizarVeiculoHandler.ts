import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import {
  ErroVeiculoNaoEncontrado,
  propagarErroVeiculo
} from '../VeiculoApplicationErrors';
import { validarAtualizarVeiculo } from '../../Validator/Veiculo/AtualizarVeiculoValidator';
import type { AtualizarVeiculoRequestDto } from '../DTOs/Requests/AtualizarVeiculoRequestDto';
import type { VeiculoResponseDto } from '../DTOs/Responses/VeiculoResponseDto';
import { mapearVeiculoParaResponse } from '../DTOs/Responses/VeiculoResponseMapper';

export class AtualizarVeiculoHandler {
  constructor(private readonly veiculos: VeiculoRepository) {}

  async execute(id: unknown, dto: AtualizarVeiculoRequestDto): Promise<VeiculoResponseDto> {
    const entrada = validarAtualizarVeiculo(id, dto);
    const veiculo = await this.veiculos.buscarPorId(entrada.id);
    if (veiculo === null) throw new ErroVeiculoNaoEncontrado(entrada.id);

    try {
      veiculo.atualizarDados(
        entrada.dados.marca,
        entrada.dados.modelo,
        entrada.dados.ano,
        entrada.dados.cor
      );
      await this.veiculos.salvar(veiculo);
      return mapearVeiculoParaResponse(veiculo);
    } catch (erro) {
      propagarErroVeiculo(erro);
    }
  }
}
