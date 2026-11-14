import type { CameraTransitoRepository } from '../../../Domain/CameraTransito/CameraTransitoRepository';
import { validarCancelarMulta } from '../../Validator/CameraTransito/CancelarMultaValidator';
import { propagarErroCameraTransito } from '../CameraTransitoApplicationErrors';
import type { CancelarMultaRequestDto } from '../DTOs/Requests/CancelarMultaRequestDto';

export class CancelarMultaHandler {
  constructor(private readonly multas: CameraTransitoRepository) {}

  async execute(dto: CancelarMultaRequestDto): Promise<void> {
    try {
      await this.multas.cancelar(validarCancelarMulta(dto));
    } catch (erro) {
      propagarErroCameraTransito(erro);
    }
  }
}
