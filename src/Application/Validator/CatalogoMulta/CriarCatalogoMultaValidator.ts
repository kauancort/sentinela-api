import { validarDadosCatalogoMulta } from './CatalogoMultaValidator';

export function validarCriarCatalogoMulta(input: unknown) {
  return validarDadosCatalogoMulta(input, true);
}
