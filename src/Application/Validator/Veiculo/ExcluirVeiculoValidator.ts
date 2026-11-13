import { validarId } from './VeiculoValidator';

export function validarExcluirVeiculo(input: unknown): string {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return validarId(input);
  }
  return validarId((input as { id?: unknown }).id);
}
