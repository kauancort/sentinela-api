import { validarId } from './VeiculoValidator';

export function validarBuscarVeiculoPorId(input: unknown): string {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return validarId(input);
  }
  return validarId((input as { id?: unknown }).id);
}
