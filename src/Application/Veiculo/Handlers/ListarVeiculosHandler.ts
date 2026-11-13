import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import { validarListarVeiculos } from '../../Validator/Veiculo/ListarVeiculosValidator';
import { mapearVeiculoParaResponse } from '../DTOs/Responses/VeiculoResponseMapper';
import type { ListarVeiculosResponseDto } from '../DTOs/Responses/ListarVeiculosResponseDto';

export class ListarVeiculosHandler {
  constructor(private readonly veiculos: VeiculoRepository) {}

  async execute(consulta: unknown = {}): Promise<ListarVeiculosResponseDto> {
    const resultado = await this.veiculos.listar(validarListarVeiculos(consulta));
    return {
      itens: resultado.itens.map((veiculo) => mapearVeiculoParaResponse(veiculo)),
      total: resultado.total,
      pagina: resultado.pagina,
      tamanhoPagina: resultado.limite
    };
  }
}
