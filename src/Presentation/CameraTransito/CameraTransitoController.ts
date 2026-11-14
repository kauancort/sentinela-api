import type { Request, Response } from 'express';
import { MultarHandler } from '../../Application/CameraTransito/Handlers/MultarHandler';
import { ProcurarPorPlacaHandler } from '../../Application/CameraTransito/Handlers/ProcurarPorPlacaHandler';
import { ListarMultasHandler } from '../../Application/CameraTransito/Handlers/ListarMultasHandler';

export class CameraTransitoController {
  constructor(
    private readonly multarHandler: MultarHandler,
    private readonly procurarPorPlacaHandler: ProcurarPorPlacaHandler,
    private readonly listarMultasHandler: ListarMultasHandler
  ) {}

  async multar(request: Request, response: Response): Promise<void> {
    const resultado = await this.multarHandler.execute(request.body);
    response.status(201).json(resultado);
  }

  async procurarPorPlaca(request: Request, response: Response): Promise<void> {
    const resultado = await this.procurarPorPlacaHandler.execute(request.query);
    response.status(200).json(resultado);
  }

  async listarMultas(request: Request, response: Response): Promise<void> {
    const resultado = await this.listarMultasHandler.execute(request.query);
    response.status(200).json(resultado);
  }
}
