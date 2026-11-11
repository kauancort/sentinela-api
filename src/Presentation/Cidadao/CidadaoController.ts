import type { Request, Response } from 'express';

import { AtualizarCidadaoHandler } from '../../Application/Cidadao/Handlers/AtualizarCidadaoHandler';
import { BuscarCidadaoPorIdHandler } from '../../Application/Cidadao/Handlers/BuscarCidadaoPorIdHandler';
import { CriarCidadaoHandler } from '../../Application/Cidadao/Handlers/CriarCidadaoHandler';
import { ExcluirCidadaoHandler } from '../../Application/Cidadao/Handlers/ExcluirCidadaoHandler';
import { ListarCidadaosHandler } from '../../Application/Cidadao/Handlers/ListarCidadaosHandler';
export class CidadaoController {
  constructor(
    private readonly criarCidadao: CriarCidadaoHandler,
    private readonly atualizarCidadao: AtualizarCidadaoHandler,
    private readonly excluirCidadao: ExcluirCidadaoHandler,
    private readonly buscarCidadaoPorId: BuscarCidadaoPorIdHandler,
    private readonly listarCidadaos: ListarCidadaosHandler
  ) {}

  async criar(request: Request, response: Response): Promise<void> {
    const cidadao = await this.criarCidadao.execute(request.body);
    response.status(201).json(cidadao);
  }

  async listar(request: Request, response: Response): Promise<void> {
    const resultado = await this.listarCidadaos.execute(request.query);
    response.status(200).json(resultado);
  }

  async buscarPorId(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    const cidadao = await this.buscarCidadaoPorId.execute({ id });
    response.status(200).json(cidadao);
  }

  async atualizar(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    const cidadao = await this.atualizarCidadao.execute(id, request.body);
    response.status(200).json(cidadao);
  }

  async excluir(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    await this.excluirCidadao.execute({ id });
    response.status(204).end();
  }
}
