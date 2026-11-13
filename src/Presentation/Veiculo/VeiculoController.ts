import type { Request, Response } from 'express';

import { AtualizarVeiculoHandler } from '../../Application/Veiculo/Handlers/AtualizarVeiculoHandler';
import { BuscarVeiculoPorIdHandler } from '../../Application/Veiculo/Handlers/BuscarVeiculoPorIdHandler';
import { CriarVeiculoHandler } from '../../Application/Veiculo/Handlers/CriarVeiculoHandler';
import { ExcluirVeiculoHandler } from '../../Application/Veiculo/Handlers/ExcluirVeiculoHandler';
import { ListarVeiculosHandler } from '../../Application/Veiculo/Handlers/ListarVeiculosHandler';
import { TransferirPropriedadeVeiculoHandler } from '../../Application/Veiculo/Handlers/TransferirPropriedadeVeiculoHandler';

export class VeiculoController {
  constructor(
    private readonly criarVeiculo: CriarVeiculoHandler,
    private readonly atualizarVeiculo: AtualizarVeiculoHandler,
    private readonly excluirVeiculo: ExcluirVeiculoHandler,
    private readonly buscarVeiculoPorId: BuscarVeiculoPorIdHandler,
    private readonly listarVeiculos: ListarVeiculosHandler,
    private readonly transferirPropriedade: TransferirPropriedadeVeiculoHandler
  ) {}

  async criar(request: Request, response: Response): Promise<void> {
    const veiculo = await this.criarVeiculo.execute(request.body);
    response.status(201).json(veiculo);
  }

  async listar(request: Request, response: Response): Promise<void> {
    const resultado = await this.listarVeiculos.execute(request.query);
    response.status(200).json(resultado);
  }

  async buscarPorId(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    const veiculo = await this.buscarVeiculoPorId.execute({ id });
    response.status(200).json(veiculo);
  }

  async atualizar(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    const veiculo = await this.atualizarVeiculo.execute(id, request.body);
    response.status(200).json(veiculo);
  }

  async transferirPropriedade(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    const veiculo = await this.transferirPropriedade.execute(id, request.body);
    response.status(200).json(veiculo);
  }

  async excluir(request: Request, response: Response): Promise<void> {
    const id = request.params.id as string;
    await this.excluirVeiculo.execute({ id });
    response.status(204).end();
  }
}
