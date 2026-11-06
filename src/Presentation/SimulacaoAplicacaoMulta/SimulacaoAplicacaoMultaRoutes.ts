import { Router } from 'express';
import { SimulacaoAplicacaoMultaController } from './SimulacaoAplicacaoMultaController';

export const simulacaoAplicacaoMultaRoutes = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     StatusSimulacao:
 *       type: string
 *       enum: [PENDENTE, APROVADA, REJEITADA]
 *       example: PENDENTE
 *     SimulacaoAplicacaoMulta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         placaVeiculo:
 *           type: string
 *           example: "ABC1D23"
 *         tipoMultaId:
 *           type: integer
 *           example: 2
 *         dataHoraCaptura:
 *           type: string
 *           format: date-time
 *           example: "2026-11-06T20:00:00.000Z"
 *         localCaptura:
 *           type: string
 *           example: "Av. Paulista, altura do nº 1500"
 *         status:
 *           $ref: '#/components/schemas/StatusSimulacao'
 *         motivoRejeicao:
 *           type: string
 *           nullable: true
 *           example: null
 *         criadoEm:
 *           type: string
 *           format: date-time
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *     CriarSimulacaoRequest:
 *       type: object
 *       required:
 *         - placaVeiculo
 *         - tipoMultaId
 *         - localCaptura
 *       properties:
 *         placaVeiculo:
 *           type: string
 *           example: "ABC1D23"
 *         tipoMultaId:
 *           type: integer
 *           example: 1
 *         dataHoraCaptura:
 *           type: string
 *           format: date-time
 *           example: "2026-11-06T20:00:00.000Z"
 *         localCaptura:
 *           type: string
 *           example: "Av. Brasil, km 12"
 *         status:
 *           $ref: '#/components/schemas/StatusSimulacao'
 *         motivoRejeicao:
 *           type: string
 *           nullable: true
 *     AtualizarSimulacaoRequest:
 *       type: object
 *       properties:
 *         placaVeiculo:
 *           type: string
 *           example: "XYZ9876"
 *         tipoMultaId:
 *           type: integer
 *           example: 3
 *         dataHoraCaptura:
 *           type: string
 *           format: date-time
 *         localCaptura:
 *           type: string
 *           example: "Rua das Flores, 200"
 *         status:
 *           $ref: '#/components/schemas/StatusSimulacao'
 *         motivoRejeicao:
 *           type: string
 *           nullable: true
 *           example: "Placa adulterada ou ilegível"
 *     ErroResposta:
 *       type: object
 *       properties:
 *         erro:
 *           type: string
 *           example: "Mensagem descritiva do erro"
 */

/**
 * @openapi
 * /simulacoes-multa:
 *   post:
 *     summary: Registra uma nova captura/simulação de infração de trânsito
 *     tags:
 *       - SimulacaoAplicacaoMulta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarSimulacaoRequest'
 *     responses:
 *       201:
 *         description: Simulação registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulacaoAplicacaoMulta'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *   get:
 *     summary: Lista todas as simulações registradas
 *     tags:
 *       - SimulacaoAplicacaoMulta
 *     responses:
 *       200:
 *         description: Lista de simulações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SimulacaoAplicacaoMulta'
 */
simulacaoAplicacaoMultaRoutes.post('/', SimulacaoAplicacaoMultaController.criar);
simulacaoAplicacaoMultaRoutes.get('/', SimulacaoAplicacaoMultaController.listar);

/**
 * @openapi
 * /simulacoes-multa/{id}:
 *   get:
 *     summary: Busca uma simulação específica pelo ID
 *     tags:
 *       - SimulacaoAplicacaoMulta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da simulação
 *     responses:
 *       200:
 *         description: Simulação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulacaoAplicacaoMulta'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       404:
 *         description: Simulação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *   put:
 *     summary: Atualiza os dados de uma simulação existente
 *     tags:
 *       - SimulacaoAplicacaoMulta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da simulação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarSimulacaoRequest'
 *     responses:
 *       200:
 *         description: Simulação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulacaoAplicacaoMulta'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       404:
 *         description: Simulação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *   delete:
 *     summary: Exclui uma simulação pelo ID
 *     tags:
 *       - SimulacaoAplicacaoMulta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da simulação
 *     responses:
 *       204:
 *         description: Simulação excluída com sucesso
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       404:
 *         description: Simulação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
simulacaoAplicacaoMultaRoutes.get('/:id', SimulacaoAplicacaoMultaController.buscarPorId);
simulacaoAplicacaoMultaRoutes.put('/:id', SimulacaoAplicacaoMultaController.atualizar);
simulacaoAplicacaoMultaRoutes.delete('/:id', SimulacaoAplicacaoMultaController.excluir);

