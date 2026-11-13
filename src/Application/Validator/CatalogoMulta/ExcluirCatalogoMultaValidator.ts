import { validarIdCatalogoMulta } from './CatalogoMultaValidator';

export function validarExcluirCatalogoMulta(input: { id: unknown }) {
  return validarIdCatalogoMulta(input?.id);
}
