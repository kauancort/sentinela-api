import type { Request, Response } from 'express';

import { AtualizarCidadaoHandler } from '../../Application/Cidadao/Handlers/AtualizarCidadaoHandler';
import { BuscarCidadaoPorIdHandler } from '../../Application/Cidadao/Handlers/BuscarCidadaoPorIdHandler';
import { CriarCidadaoHandler } from '../../Application/Cidadao/Handlers/CriarCidadaoHandler';
import { ExcluirCidadaoHandler } from '../../Application/Cidadao/Handlers/ExcluirCidadaoHandler';
import { ListarCidadaosHandler } from '../../Application/Cidadao/Handlers/ListarCidadaosHandler';
import {
  validarAtualizarCidadaoBody,
  validarCriarCidadaoBody,
  validarIdCidadao,
  validarListarCidadaosQuery
} from './CidadaoRequestValidation';

export class CidadaoController {
  constructor(
    private readonly criarCidadao: CriarCidadaoHandler,
    private readonly atualizarCidadao: AtualizarCidadaoHandler,
    private readonly excluirCidadao: ExcluirCidadaoHandler,
    private readonly buscarCidadaoPorId: BuscarCidadaoPorIdHandler,
    private readonly listarCidadaos: ListarCidadaosHandler
  ) {}

  async criar(request: Request, response: Response): Promise<void> {
    const dto = validarCriarCidadaoBody(request.body);
    const cidadao = await this.criarCidadao.execute(dto);
    response.status(201).json(cidadao);
  }

  async listar(request: Request, response: Response): Promise<void> {
    const consulta = validarListarCidadaosQuery(request.query);
    const resultado = await this.listarCidadaos.execute(consulta);
    response.status(200).json(resultado);
  }

  async buscarPorId(request: Request, response: Response): Promise<void> {
    const id = validarIdCidadao(request.params.id);
    const cidadao = await this.buscarCidadaoPorId.execute({ id });
    response.status(200).json(cidadao);
  }

  async atualizar(request: Request, response: Response): Promise<void> {
    const id = validarIdCidadao(request.params.id);
    const dto = validarAtualizarCidadaoBody(request.body);
    const cidadao = await this.atualizarCidadao.execute(id, dto);
    response.status(200).json(cidadao);
  }

  async excluir(request: Request, response: Response): Promise<void> {
    const id = validarIdCidadao(request.params.id);
    await this.excluirCidadao.execute({ id });
    response.status(204).end();
  }
}
