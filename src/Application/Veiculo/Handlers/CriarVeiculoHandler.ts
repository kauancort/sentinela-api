import { Veiculo } from '../../../Domain/Veiculo/Veiculo';
import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import {
  ErroConflitoVeiculo,
  ErroProprietarioVeiculoNaoEncontrado,
  propagarErroVeiculo
} from '../VeiculoApplicationErrors';
import { validarCriarVeiculo } from '../../Validator/Veiculo/CriarVeiculoValidator';
import type { CriarVeiculoRequestDto } from '../DTOs/Requests/CriarVeiculoRequestDto';
import type { VeiculoResponseDto } from '../DTOs/Responses/VeiculoResponseDto';
import { mapearVeiculoParaResponse } from '../DTOs/Responses/VeiculoResponseMapper';

export class CriarVeiculoHandler {
  constructor(private readonly veiculos: VeiculoRepository) {}

  async execute(dto: CriarVeiculoRequestDto): Promise<VeiculoResponseDto> {
    try {
      const dados = validarCriarVeiculo(dto);
      const veiculo = Veiculo.criar(dados);

      const proprietarioExiste = await this.veiculos.proprietarioExiste(veiculo.proprietarioId);
      if (!proprietarioExiste) {
        throw new ErroProprietarioVeiculoNaoEncontrado(veiculo.proprietarioId);
      }

      const placaExistente = await this.veiculos.buscarPorPlaca(veiculo.placa);
      if (placaExistente !== null) throw new ErroConflitoVeiculo('placa');

      await this.veiculos.salvar(veiculo);
      return mapearVeiculoParaResponse(veiculo);
    } catch (erro) {
      propagarErroVeiculo(erro);
    }
  }
}
