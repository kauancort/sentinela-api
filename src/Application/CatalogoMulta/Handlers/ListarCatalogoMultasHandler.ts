import type { CatalogoMultaRepository } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { validarListarCatalogoMultas } from '../../Validator/CatalogoMulta/ListarCatalogoMultasValidator';
import type { ListarCatalogoMultasResponseDto } from '../DTOs/Responses/ListarCatalogoMultasResponseDto';
import { mapearCatalogoMultaParaResponse } from '../DTOs/Responses/CatalogoMultaResponseMapper';

export class ListarCatalogoMultasHandler {
  constructor(private readonly catalogoMultas: CatalogoMultaRepository) {}

  async execute(consulta: unknown = {}): Promise<ListarCatalogoMultasResponseDto> {
    const resultado = await this.catalogoMultas.listar(validarListarCatalogoMultas(consulta));
    return {
      itens: resultado.itens.map(mapearCatalogoMultaParaResponse),
      total: resultado.total,
      pagina: resultado.pagina,
      tamanhoPagina: resultado.limite
    };
  }
}
