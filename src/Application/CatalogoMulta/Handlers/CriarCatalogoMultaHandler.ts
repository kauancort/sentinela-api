import { CatalogoMulta } from '../../../Domain/CatalogoMulta/CatalogoMulta';
import type { CatalogoMultaRepository } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { validarCriarCatalogoMulta } from '../../Validator/CatalogoMulta/CriarCatalogoMultaValidator';
import type { CriarCatalogoMultaRequestDto } from '../DTOs/Requests/CriarCatalogoMultaRequestDto';
import type { CatalogoMultaResponseDto } from '../DTOs/Responses/CatalogoMultaResponseDto';
import { mapearCatalogoMultaParaResponse } from '../DTOs/Responses/CatalogoMultaResponseMapper';
import { ErroConflitoCatalogoMulta, propagarErroCatalogoMulta } from '../CatalogoMultaApplicationErrors';

export class CriarCatalogoMultaHandler {
  constructor(private readonly catalogoMultas: CatalogoMultaRepository) {}

  async execute(dto: CriarCatalogoMultaRequestDto): Promise<CatalogoMultaResponseDto> {
    try {
      const catalogoMulta = CatalogoMulta.criar(validarCriarCatalogoMulta(dto));
      if (await this.catalogoMultas.buscarPorCodigo(catalogoMulta.codigo)) {
        throw new ErroConflitoCatalogoMulta('codigo');
      }
      await this.catalogoMultas.salvar(catalogoMulta);
      return mapearCatalogoMultaParaResponse(catalogoMulta);
    } catch (erro) {
      propagarErroCatalogoMulta(erro);
    }
  }
}
