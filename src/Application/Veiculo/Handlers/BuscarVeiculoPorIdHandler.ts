import { validarBuscarVeiculoPorId } from '../../Validator/Veiculo/BuscarVeiculoPorIdValidator';
import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import { ErroVeiculoNaoEncontrado } from '../VeiculoApplicationErrors';
import type { BuscarVeiculoPorIdRequestDto } from '../DTOs/Requests/BuscarVeiculoPorIdRequestDto';
import type { VeiculoResponseDto } from '../DTOs/Responses/VeiculoResponseDto';
import { mapearVeiculoParaResponse } from '../DTOs/Responses/VeiculoResponseMapper';

export class BuscarVeiculoPorIdHandler {
  constructor(private readonly veiculos: VeiculoRepository) {}

  async execute(dto: BuscarVeiculoPorIdRequestDto): Promise<VeiculoResponseDto> {
    const id = validarBuscarVeiculoPorId(dto);
    const veiculo = await this.veiculos.buscarPorId(id);
    if (veiculo === null) throw new ErroVeiculoNaoEncontrado(id);
    return mapearVeiculoParaResponse(veiculo);
  }
}
