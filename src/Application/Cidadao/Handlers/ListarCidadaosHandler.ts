import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import { validarListarCidadaos } from '../../Validator/Cidadao/ListarCidadaosValidator';
import { mapearCidadaoParaResponse } from '../DTOs/Responses/CidadaoResponseMapper';
import type { ListarCidadaosResponseDto } from '../DTOs/Responses/ListarCidadaosResponseDto';

export class ListarCidadaosHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(consulta: unknown = {}): Promise<ListarCidadaosResponseDto> {
    const resultado = await this.cidadaos.listar(validarListarCidadaos(consulta));
    return {
      itens: resultado.itens.map((cidadao) => mapearCidadaoParaResponse(cidadao)),
      total: resultado.total,
      pagina: resultado.pagina,
      tamanhoPagina: resultado.limite
    };
  }
}
