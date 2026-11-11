import { validarId } from './CidadaoValidator';

export function validarBuscarCidadaoPorId(input: { id: unknown }) {
  return validarId(input?.id);
}
