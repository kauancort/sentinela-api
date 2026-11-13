import type { CatalogoMultaRepository } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { validarExcluirCatalogoMulta } from '../../Validator/CatalogoMulta/ExcluirCatalogoMultaValidator';
import type { ExcluirCatalogoMultaRequestDto } from '../DTOs/Requests/ExcluirCatalogoMultaRequestDto';
import { ErroCatalogoMultaNaoEncontrado, propagarErroCatalogoMulta } from '../CatalogoMultaApplicationErrors';

export class ExcluirCatalogoMultaHandler {
  constructor(private readonly catalogoMultas: CatalogoMultaRepository) {}

  async execute(dto: ExcluirCatalogoMultaRequestDto): Promise<void> {
    const id = validarExcluirCatalogoMulta(dto);
    if (!await this.catalogoMultas.buscarPorId(id)) throw new ErroCatalogoMultaNaoEncontrado(id);
    try {
      await this.catalogoMultas.excluir(id);
    } catch (erro) {
      propagarErroCatalogoMulta(erro);
    }
  }
}
