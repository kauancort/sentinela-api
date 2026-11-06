import { NextFunction, Request, Response } from 'express';
import { AtualizarSimulacaoHandler } from '../../Application/SimulacaoAplicacaoMulta/AtualizarSimulacao/AtualizarSimulacaoHandler';
import { BuscarSimulacaoPorIdHandler } from '../../Application/SimulacaoAplicacaoMulta/BuscarSimulacaoPorId/BuscarSimulacaoPorIdHandler';
import { CriarSimulacaoHandler } from '../../Application/SimulacaoAplicacaoMulta/CriarSimulacao/CriarSimulacaoHandler';
import { ExcluirSimulacaoHandler } from '../../Application/SimulacaoAplicacaoMulta/ExcluirSimulacao/ExcluirSimulacaoHandler';
import { ListarSimulacoesHandler } from '../../Application/SimulacaoAplicacaoMulta/ListarSimulacoes/ListarSimulacoesHandler';
import {
  DadosSimulacaoInvalidosError,
  SimulacaoNaoEncontradaError
} from '../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import { SimulacaoAplicacaoMultaPrismaRepository } from '../../Infrastructure/Persistence/Prisma/SimulacaoAplicacaoMultaPrismaRepository';

const repositorio = new SimulacaoAplicacaoMultaPrismaRepository();
const criarHandler = new CriarSimulacaoHandler(repositorio);
const listarHandler = new ListarSimulacoesHandler(repositorio);
const buscarPorIdHandler = new BuscarSimulacaoPorIdHandler(repositorio);
const atualizarHandler = new AtualizarSimulacaoHandler(repositorio);
const excluirHandler = new ExcluirSimulacaoHandler(repositorio);

const responderErro = (res: Response, error: unknown, next: NextFunction) => {
  if (error instanceof DadosSimulacaoInvalidosError) {
    return res.status(400).json({ erro: error.message });
  }
  if (error instanceof SimulacaoNaoEncontradaError) {
    return res.status(404).json({ erro: error.message });
  }
  return next(error);
};

export class SimulacaoAplicacaoMultaController {
  public static async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await criarHandler.executar(req.body);
      return res.status(201).json(resultado);
    } catch (error) {
      return responderErro(res, error, next);
    }
  }

  public static async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await listarHandler.executar();
      return res.status(200).json(resultado);
    } catch (error) {
      return responderErro(res, error, next);
    }
  }

  public static async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const resultado = await buscarPorIdHandler.executar(id);
      return res.status(200).json(resultado);
    } catch (error) {
      return responderErro(res, error, next);
    }
  }

  public static async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const resultado = await atualizarHandler.executar(id, req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      return responderErro(res, error, next);
    }
  }

  public static async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await excluirHandler.executar(id);
      return res.status(204).send();
    } catch (error) {
      return responderErro(res, error, next);
    }
  }
}

