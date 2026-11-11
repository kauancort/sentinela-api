import { validarId } from './CidadaoValidator';

export function validarExcluirCidadao(input: { id: unknown }) {
  return validarId(input?.id);
}
