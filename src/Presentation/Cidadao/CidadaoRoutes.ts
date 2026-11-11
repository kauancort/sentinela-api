import { Router, type Request, type Response, type RequestHandler } from 'express';

import { CidadaoController } from './CidadaoController';

type AcaoRota = (request: Request, response: Response) => Promise<void>;

function rotaAssincrona(acao: AcaoRota): RequestHandler {
  return (request, response, next) => {
    void acao(request, response).catch(next);
  };
}

/**
 * @openapi
 * /cidadaos:
 *   post:
 *     summary: Cadastra um cidadão
 *     tags: [Cidadãos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CidadaoRequest'
 *     responses:
 *       '201': { description: Cidadão cadastrado }
 *       '400': { description: Entrada inválida }
 *       '409': { description: CPF ou CNH duplicados }
 *   get:
 *     summary: Lista cidadãos de forma paginada
 *     tags: [Cidadãos]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: tamanhoPagina, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: nome, schema: { type: string } }
 *       - { in: query, name: cpf, schema: { type: string } }
 *     responses:
 *       '200': { description: Página de cidadãos }
 *       '400': { description: Query inválida }
 */
/**
 * @openapi
 * /cidadaos/{id}:
 *   get:
 *     summary: Busca cidadão pelo ID
 *     tags: [Cidadãos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200': { description: Cidadão encontrado }
 *       '400': { description: ID inválido }
 *       '404': { description: Cidadão ausente }
 *   put:
 *     summary: Atualiza os dados editáveis do cidadão
 *     tags: [Cidadãos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CidadaoUpdateRequest'
 *     responses:
 *       '200': { description: Cidadão atualizado }
 *       '400': { description: Entrada inválida }
 *       '404': { description: Cidadão ausente }
 *       '409': { description: CPF ou CNH duplicados }
 *   delete:
 *     summary: Exclui um cidadão
 *     tags: [Cidadãos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '204': { description: Cidadão excluído }
 *       '400': { description: ID inválido }
 *       '404': { description: Cidadão ausente }
 *       '409': { description: Exclusão bloqueada por vínculo }
 */
export function criarCidadaoRoutes(controller: CidadaoController): Router {
  const router = Router();

  router.post('/', rotaAssincrona((request, response) => controller.criar(request, response)));
  router.get('/', rotaAssincrona((request, response) => controller.listar(request, response)));
  router.get('/:id', rotaAssincrona((request, response) => controller.buscarPorId(request, response)));
  router.put('/:id', rotaAssincrona((request, response) => controller.atualizar(request, response)));
  router.delete('/:id', rotaAssincrona((request, response) => controller.excluir(request, response)));

  return router;
}
