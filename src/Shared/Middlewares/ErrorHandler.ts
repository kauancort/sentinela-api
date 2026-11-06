import { NextFunction, Request, Response } from 'express';
import {
  DadosSimulacaoInvalidosError,
  SimulacaoNaoEncontradaError
} from '../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import { AppError } from '../Errors/AppError';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof DadosSimulacaoInvalidosError) {
    return res.status(400).json({ erro: error.message });
  }

  if (error instanceof SimulacaoNaoEncontradaError) {
    return res.status(404).json({ erro: error.message });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ erro: error.message });
  }

  console.error('Erro interno do servidor:', error);
  return res.status(500).json({ erro: 'Erro interno do servidor ao processar a requisição.' });
}

