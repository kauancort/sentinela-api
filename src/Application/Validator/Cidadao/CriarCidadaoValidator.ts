import { validarDados } from './CidadaoValidator';

export function validarCriarCidadao(input: unknown) {
  return validarDados(input);
}
