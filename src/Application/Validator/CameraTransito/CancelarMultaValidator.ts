import { validarObjeto, validarUuid } from './CameraTransitoValidator';

export function validarCancelarMulta(input: unknown): string {
  const dados = validarObjeto(input, ['id'], ['id']);
  return validarUuid(dados.id, 'id');
}
