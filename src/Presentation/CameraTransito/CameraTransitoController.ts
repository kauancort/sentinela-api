import type { Request, Response } from 'express';
import { MultarHandler } from '../../Application/CameraTransito/Handlers/MultarHandler';

export class CameraTransitoController {
  constructor(private readonly multarHandler: MultarHandler) {}

  async multar(request: Request, response: Response): Promise<void> {
    const resultado = await this.multarHandler.execute(request.body);
    response.status(201).json(resultado);
  }
}
