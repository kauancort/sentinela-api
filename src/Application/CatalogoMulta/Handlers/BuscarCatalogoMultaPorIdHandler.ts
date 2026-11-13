import type { CatalogoMultaRepository } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { validarBuscarCatalogoMultaPorId } from '../../Validator/CatalogoMulta/BuscarCatalogoMultaPorIdValidator';
import type { BuscarCatalogoMultaPorIdRequestDto } from '../DTOs/Requests/BuscarCatalogoMultaPorIdRequestDto';
import type { CatalogoMultaResponseDto } from '../DTOs/Responses/CatalogoMultaResponseDto';
import { mapearCatalogoMultaParaResponse } from '../DTOs/Responses/CatalogoMultaResponseMapper';
import { ErroCatalogoMultaNaoEncontrado } from '../CatalogoMultaApplicationErrors';

export class BuscarCatalogoMultaPorIdHandler {
  constructor(private readonly catalogoMultas: CatalogoMultaRepository) {}

  async execute(dto: BuscarCatalogoMultaPorIdRequestDto): Promise<CatalogoMultaResponseDto> {
    const id = validarBuscarCatalogoMultaPorId(dto);
    const catalogoMulta = await this.catalogoMultas.buscarPorId(id);
    if (!catalogoMulta) throw new ErroCatalogoMultaNaoEncontrado(id);
    return mapearCatalogoMultaParaResponse(catalogoMulta);
  }
}
