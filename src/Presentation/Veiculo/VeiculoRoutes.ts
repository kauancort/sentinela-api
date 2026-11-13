import { Router, type Request, type Response, type RequestHandler } from 'express';

import { VeiculoController } from './VeiculoController';

type AcaoRota = (request: Request, response: Response) => Promise<void>;

function rotaAssincrona(acao: AcaoRota): RequestHandler {
  return (request, response, next) => {
    void acao(request, response).catch(next);
  };
}

export function criarVeiculoRoutes(controller: VeiculoController): Router {
  const router = Router();

  router.post('/', rotaAssincrona((request, response) => controller.criar(request, response)));
  router.get('/', rotaAssincrona((request, response) => controller.listar(request, response)));
  router.patch(
    '/:id/proprietario',
    rotaAssincrona((request, response) => controller.transferirPropriedade(request, response))
  );
  router.get('/:id', rotaAssincrona((request, response) => controller.buscarPorId(request, response)));
  router.put('/:id', rotaAssincrona((request, response) => controller.atualizar(request, response)));
  router.delete('/:id', rotaAssincrona((request, response) => controller.excluir(request, response)));

  return router;
}
