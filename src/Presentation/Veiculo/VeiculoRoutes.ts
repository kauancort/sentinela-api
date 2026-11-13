import { Router, type Request, type Response, type RequestHandler } from 'express';

import { VeiculoController } from './VeiculoController';

type AcaoRota = (request: Request, response: Response) => Promise<void>;

function rotaAssincrona(acao: AcaoRota): RequestHandler {
  return (request, response, next) => {
    void acao(request, response).catch(next);
  };
}

/**
 * @openapi
 * /veiculos:
 *   post:
 *     summary: Cadastra um veículo
 *     tags: [Veículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VeiculoCreateRequest' }
 *     responses:
 *       '201':
 *         description: Veículo cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoResponse' }
 *       '400':
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '404':
 *         description: Proprietário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '409':
 *         description: Placa já cadastrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *   get:
 *     summary: Lista veículos com paginação e filtros
 *     tags: [Veículos]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: tamanhoPagina, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: placa, schema: { type: string, example: ABC-1234 } }
 *       - { in: query, name: marca, schema: { type: string, example: Toyota } }
 *       - { in: query, name: modelo, schema: { type: string, example: Corolla } }
 *       - { in: query, name: ano, schema: { type: integer, example: 2024 } }
 *       - { in: query, name: cor, schema: { type: string, example: Prata } }
 *       - { in: query, name: proprietarioId, schema: { type: string, format: uuid } }
 *     responses:
 *       '200':
 *         description: Página de veículos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ListarVeiculosResponse' }
 *       '400':
 *         description: Consulta inválida
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 * /veiculos/{id}:
 *   get:
 *     summary: Busca um veículo pelo ID
 *     tags: [Veículos]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       '200':
 *         description: Veículo encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoResponse' }
 *       '400':
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '404':
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *   put:
 *     summary: Atualiza os dados editáveis de um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VeiculoUpdateRequest' }
 *     responses:
 *       '200':
 *         description: Veículo atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoResponse' }
 *       '400':
 *         description: ID ou dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '404':
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *   delete:
 *     summary: Exclui um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       '204': { description: Veículo excluído sem corpo de resposta }
 *       '400':
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '404':
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '409':
 *         description: Exclusão impedida por vínculo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 * /veiculos/{id}/proprietario:
 *   patch:
 *     summary: Transfere a propriedade de um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VeiculoTransferenciaRequest' }
 *     responses:
 *       '200':
 *         description: Propriedade transferida
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoResponse' }
 *       '400':
 *         description: ID ou dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 *       '404':
 *         description: Veículo ou proprietário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/VeiculoErrorResponse' }
 */
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
