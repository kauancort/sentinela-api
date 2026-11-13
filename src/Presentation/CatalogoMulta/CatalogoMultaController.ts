import type { Request, Response } from 'express';
import { AtualizarCatalogoMultaHandler } from '../../Application/CatalogoMulta/Handlers/AtualizarCatalogoMultaHandler';
import { BuscarCatalogoMultaPorIdHandler } from '../../Application/CatalogoMulta/Handlers/BuscarCatalogoMultaPorIdHandler';
import { CriarCatalogoMultaHandler } from '../../Application/CatalogoMulta/Handlers/CriarCatalogoMultaHandler';
import { ExcluirCatalogoMultaHandler } from '../../Application/CatalogoMulta/Handlers/ExcluirCatalogoMultaHandler';
import { ListarCatalogoMultasHandler } from '../../Application/CatalogoMulta/Handlers/ListarCatalogoMultasHandler';

export class CatalogoMultaController {
  constructor(
    private readonly criarCatalogoMulta: CriarCatalogoMultaHandler,
    private readonly atualizarCatalogoMulta: AtualizarCatalogoMultaHandler,
    private readonly excluirCatalogoMulta: ExcluirCatalogoMultaHandler,
    private readonly buscarCatalogoMultaPorId: BuscarCatalogoMultaPorIdHandler,
    private readonly listarCatalogoMultas: ListarCatalogoMultasHandler
  ) {}

  async criar(request: Request, response: Response): Promise<void> {
    response.status(201).json(await this.criarCatalogoMulta.execute(request.body));
  }

  async listar(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.listarCatalogoMultas.execute(request.query));
  }

  async buscarPorId(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.buscarCatalogoMultaPorId.execute({ id: request.params.id as string }));
  }

  async atualizar(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.atualizarCatalogoMulta.execute(request.params.id, request.body));
  }

  async excluir(request: Request, response: Response): Promise<void> {
    await this.excluirCatalogoMulta.execute({ id: request.params.id as string });
    response.status(204).end();
  }
}
