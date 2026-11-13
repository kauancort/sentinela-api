import { validarIdCatalogoMulta } from './CatalogoMultaValidator';

export function validarBuscarCatalogoMultaPorId(input: { id: unknown }) {
  return validarIdCatalogoMulta(input?.id);
}
