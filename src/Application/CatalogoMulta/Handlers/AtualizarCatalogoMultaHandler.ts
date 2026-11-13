import { CatalogoMulta } from '../../../Domain/CatalogoMulta/CatalogoMulta';
import type { CatalogoMultaRepository } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { validarAtualizarCatalogoMulta } from '../../Validator/CatalogoMulta/AtualizarCatalogoMultaValidator';
import type { AtualizarCatalogoMultaRequestDto } from '../DTOs/Requests/AtualizarCatalogoMultaRequestDto';
import type { CatalogoMultaResponseDto } from '../DTOs/Responses/CatalogoMultaResponseDto';
import { mapearCatalogoMultaParaResponse } from '../DTOs/Responses/CatalogoMultaResponseMapper';
import {
  ErroCatalogoMultaNaoEncontrado,
  ErroConflitoCatalogoMulta,
  propagarErroCatalogoMulta
} from '../CatalogoMultaApplicationErrors';

export class AtualizarCatalogoMultaHandler {
  constructor(private readonly catalogoMultas: CatalogoMultaRepository) {}

  async execute(id: unknown, dto: AtualizarCatalogoMultaRequestDto): Promise<CatalogoMultaResponseDto> {
    const validado = validarAtualizarCatalogoMulta(id, dto);
    const atual = await this.catalogoMultas.buscarPorId(validado.id);
    if (!atual) throw new ErroCatalogoMultaNaoEncontrado(validado.id);
    try {
      const porCodigo = await this.catalogoMultas.buscarPorCodigo(validado.dados.codigo);
      if (porCodigo && porCodigo.id !== validado.id) throw new ErroConflitoCatalogoMulta('codigo');
      const catalogoMulta = new CatalogoMulta(atual, atual.id);
      catalogoMulta.atualizar(validado.dados);
      await this.catalogoMultas.salvar(catalogoMulta);
      return mapearCatalogoMultaParaResponse(catalogoMulta);
    } catch (erro) {
      propagarErroCatalogoMulta(erro);
    }
  }
}
