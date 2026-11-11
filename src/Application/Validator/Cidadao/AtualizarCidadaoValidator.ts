import { validarDados, validarId } from './CidadaoValidator';

export function validarAtualizarCidadao(id: unknown, input: unknown) {
  return { id: validarId(id), dados: validarDados(input, true) };
}
