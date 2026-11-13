import { validarDadosCatalogoMulta, validarIdCatalogoMulta } from './CatalogoMultaValidator';

export function validarAtualizarCatalogoMulta(id: unknown, input: unknown) {
  return { id: validarIdCatalogoMulta(id), dados: validarDadosCatalogoMulta(input) };
}
