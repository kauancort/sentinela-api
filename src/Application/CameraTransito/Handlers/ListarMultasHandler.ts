import type { CameraTransitoRepository } from '../../../Domain/CameraTransito/CameraTransitoRepository';
import { validarListarMultas } from '../../Validator/CameraTransito/ListarMultasValidator';
import { propagarErroCameraTransito } from '../CameraTransitoApplicationErrors';
import type { ListarMultasResponseDto } from '../DTOs/Responses/ListarMultasResponseDto';
import { mapearListarMultasParaResponse } from '../DTOs/Responses/ListarMultasResponseMapper';

export class ListarMultasHandler {
  constructor(private readonly multas: CameraTransitoRepository) {}

  async execute(consulta: unknown = {}): Promise<ListarMultasResponseDto> {
    try {
      const resultado = await this.multas.listar(validarListarMultas(consulta));
      return mapearListarMultasParaResponse(resultado);
    } catch (erro) {
      propagarErroCameraTransito(erro);
    }
  }
}
