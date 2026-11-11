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
 *             $ref: '#/components/schemas/CidadaoCreateRequest'
 *           examples:
 *             semCnh:
 *               summary: Cadastro sem CNH
 *               value:
 *                 nome: Ana Exemplo
 *                 cpf: '529.982.247-25'
 *                 email: ana@example.com
 *                 possuiCnh: false
 *             comCnh:
 *               summary: Cadastro com CNH regular
 *               value:
 *                 nome: Bruno Exemplo
 *                 cpf: '111.444.777-35'
 *                 email: bruno@example.com
 *                 possuiCnh: true
 *                 cnhNumero: '00012345678'
 *                 cnhValidade: '2030-12-31'
 *                 situacaoCnh: REGULAR
 *                 motivoSituacaoCnh: null
 *                 exerceAtividadeRemunerada: false
 *     responses:
 *       '201':
 *         description: Cidadão cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CidadaoResponse'
 *             examples:
 *               semCnh:
 *                 summary: Resposta para cadastro sem CNH
 *                 value:
 *                   id: 550e8400-e29b-41d4-a716-446655440000
 *                   nome: Ana Exemplo
 *                   cpf: '52998224725'
 *                   email: ana@example.com
 *                   possuiCnh: false
 *                   cnhNumero: null
 *                   cnhValidade: null
 *                   situacaoCnh: SEM_HABILITACAO
 *                   motivoSituacaoCnh: null
 *                   exerceAtividadeRemunerada: false
 *               comCnh:
 *                 summary: Resposta para cadastro com CNH regular
 *                 value:
 *                   id: 9b2f22d6-2d63-4b35-8c00-1234567890ab
 *                   nome: Bruno Exemplo
 *                   cpf: '11144477735'
 *                   email: bruno@example.com
 *                   possuiCnh: true
 *                   cnhNumero: '00012345678'
 *                   cnhValidade: '2030-12-31'
 *                   situacaoCnh: REGULAR
 *                   motivoSituacaoCnh: null
 *                   exerceAtividadeRemunerada: false
 *       '400':
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '409':
 *         description: CPF ou número de CNH já cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '500': { description: Falha inesperada }
 *   get:
 *     summary: Lista cidadãos de forma paginada
 *     tags: [Cidadãos]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         description: Número da página (padrão 1).
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: tamanhoPagina
 *         description: Itens por página (padrão 20, máximo 100).
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: nome
 *         description: Filtro parcial por nome.
 *         schema: { type: string, example: Ana }
 *       - in: query
 *         name: cpf
 *         description: Filtro exato por CPF; aceita CPF com ou sem máscara.
 *         schema: { type: string, example: '529.982.247-25' }
 *     responses:
 *       '200':
 *         description: Página de cidadãos. O CPF é retornado normalizado em 11 dígitos.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ListarCidadaosResponse' }
 *             example:
 *               itens:
 *                 - id: 550e8400-e29b-41d4-a716-446655440000
 *                   nome: Ana Exemplo
 *                   cpf: '52998224725'
 *                   email: ana@example.com
 *                   possuiCnh: false
 *                   cnhNumero: null
 *                   cnhValidade: null
 *                   situacaoCnh: SEM_HABILITACAO
 *                   motivoSituacaoCnh: null
 *                   exerceAtividadeRemunerada: false
 *               total: 1
 *               pagina: 1
 *               tamanhoPagina: 20
 *       '400':
 *         description: Query ou CPF inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '500': { description: Falha inesperada }
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
 *       '200':
 *         description: Cidadão encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoResponse' }
 *       '400':
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '404':
 *         description: Cidadão ausente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '500': { description: Falha inesperada }
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
 *           example:
 *             nome: Ana Exemplo Atualizada
 *             cpf: '529.982.247-25'
 *             email: ana@example.com
 *             possuiCnh: false
 *             cnhNumero: null
 *             cnhValidade: null
 *             situacaoCnh: SEM_HABILITACAO
 *             motivoSituacaoCnh: null
 *             exerceAtividadeRemunerada: false
 *     responses:
 *       '200':
 *         description: Cidadão atualizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoResponse' }
 *       '400':
 *         description: ID ou dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '404':
 *         description: Cidadão ausente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '409':
 *         description: CPF ou número de CNH já cadastrado em outro cidadão
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '500': { description: Falha inesperada }
 *   delete:
 *     summary: Exclui um cidadão
 *     tags: [Cidadãos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '204':
 *         description: Cidadão excluído. A resposta não contém corpo.
 *       '400':
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '404':
 *         description: Cidadão ausente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '409':
 *         description: Exclusão bloqueada por vínculo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CidadaoErrorResponse' }
 *       '500': { description: Falha inesperada }
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
