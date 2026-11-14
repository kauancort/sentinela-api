import type { ProcurarPorPlacaRequestDto } from '../../CameraTransito/DTOs/Requests/ProcurarPorPlacaRequestDto';
import { validarObjeto, validarPlaca } from './CameraTransitoValidator';

export function validarProcurarPorPlaca(input: unknown): ProcurarPorPlacaRequestDto {
  const consulta = validarObjeto(input, ['placa'], ['placa']);
  return { placa: validarPlaca(consulta.placa) };
}
