import { Router, type Request, type RequestHandler, type Response } from 'express';
import { CatalogoMultaController } from './CatalogoMultaController';

type AcaoRota = (request: Request, response: Response) => Promise<void>;
function rotaAssincrona(acao: AcaoRota): RequestHandler {
  return (request, response, next) => void acao(request, response).catch(next);
}

/**
 * @openapi
 * /catalogo-multas:
 *   post:
 *     summary: Cadastra um item no CatalogoMulta
 *     tags: [CatalogoMulta]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CatalogoMultaCreateRequest' }
 *     responses:
 *       '201':
 *         description: CatalogoMulta cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CatalogoMultaResponse' }
 *       '400': { description: Dados inválidos }
 *       '409': { description: Código já cadastrado }
 *   get:
 *     summary: Lista o CatalogoMulta com paginação e filtros
 *     tags: [CatalogoMulta]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: tamanhoPagina, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: codigo, schema: { type: string } }
 *       - { in: query, name: descricao, schema: { type: string } }
 *       - { in: query, name: gravidade, schema: { type: string, enum: [LEVE, MEDIA, GRAVE, GRAVISSIMA] } }
 *       - { in: query, name: responsabilidade, schema: { type: string, enum: [CONDUTOR, PROPRIETARIO] } }
 *       - { in: query, name: ativo, schema: { type: boolean } }
 *     responses:
 *       '200':
 *         description: Página do CatalogoMulta
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ListarCatalogoMultasResponse' }
 *       '400': { description: Consulta inválida }
 */
/**
 * @openapi
 * /catalogo-multas/{id}:
 *   get:
 *     summary: Consulta um CatalogoMulta pelo identificador
 *     tags: [CatalogoMulta]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       '200':
 *         description: CatalogoMulta encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CatalogoMultaResponse' }
 *       '400': { description: ID inválido }
 *       '404': { description: CatalogoMulta não encontrado }
 *   put:
 *     summary: Atualiza todos os campos editáveis de um CatalogoMulta
 *     tags: [CatalogoMulta]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CatalogoMultaUpdateRequest' }
 *     responses:
 *       '200':
 *         description: CatalogoMulta atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CatalogoMultaResponse' }
 *       '400': { description: ID ou dados inválidos }
 *       '404': { description: CatalogoMulta não encontrado }
 *       '409': { description: Código já cadastrado em outro registro }
 *   delete:
 *     summary: Exclui um CatalogoMulta
 *     tags: [CatalogoMulta]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       '204': { description: CatalogoMulta excluído sem corpo de resposta }
 *       '400': { description: ID inválido }
 *       '404': { description: CatalogoMulta não encontrado }
 *       '409': { description: Exclusão impedida por vínculo }
 */
export function criarCatalogoMultaRoutes(controller: CatalogoMultaController): Router {
  const router = Router();
  router.post('/', rotaAssincrona((request, response) => controller.criar(request, response)));
  router.get('/', rotaAssincrona((request, response) => controller.listar(request, response)));
  router.get('/:id', rotaAssincrona((request, response) => controller.buscarPorId(request, response)));
  router.put('/:id', rotaAssincrona((request, response) => controller.atualizar(request, response)));
  router.delete('/:id', rotaAssincrona((request, response) => controller.excluir(request, response)));
  return router;
}
