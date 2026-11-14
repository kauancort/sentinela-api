import { Router } from 'express';
import type { CameraTransitoController } from './CameraTransitoController';

/**
 * @openapi
 * /camera-transito/multar:
 *   post:
 *     summary: Registra uma multa e projeta a pontuação do responsável
 *     tags: [CameraTransito]
 *     description: >-
 *       Responsabilidade definida pelo catálogo ativo. Proprietário nunca é inferido como condutor.
 *       Sem condutor em infração de sua responsabilidade, registra AGUARDANDO_IDENTIFICACAO.
 *       Janela UTC (T menos 12 meses de calendário, T], ajustada ao fim do mês.
 *       Limites 40/30/20 com zero/uma/duas ou mais gravíssimas computáveis; EAR sempre 40.
 *       Canceladas, pendentes, sem pontos e autossuspensivas não entram na soma.
 *       Projeção acadêmica com o cadastro atual e a leitura disponível, sem reconstruir CNH histórica
 *       ou garantir saldo administrativo serializado sob concorrência. Não altera a CNH,
 *       envia notificações ou cria multas adicionais. A mesma ocorrência gera conflito, inclusive sob concorrência.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MultarRequest' }
 *           examples:
 *             condutorInformado:
 *               value: { ocorrenciaId: f8fdb891-12aa-4d12-aecb-85198bedca01, codigoCamera: CAM-001, placa: ABC1D23, catalogoMultaId: 8bb197c0-5f68-41c4-a780-a6f729d64dac, condutorId: 550e8400-e29b-41d4-a716-446655440000, dataHoraOcorrencia: '2026-11-12T12:00:00-03:00', local: 'Avenida Brasil, 100' }
 *             semCondutor:
 *               value: { ocorrenciaId: f8fdb891-12aa-4d12-aecb-85198bedca02, codigoCamera: CAM-001, placa: ABC1D23, catalogoMultaId: 8bb197c0-5f68-41c4-a780-a6f729d64dac, condutorId: null, dataHoraOcorrencia: '2026-11-12T12:00:00Z', local: 'Avenida Brasil, 100' }
 *     responses:
 *       '201':
 *         description: Multa registrada, análise e pendências (IDs dos exemplos exigem cadastros existentes)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MultarResponse' }
 *       '400':
 *         description: Entrada inválida, campo desconhecido, data sem fuso, irreal ou futura
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 *       '404':
 *         description: Veículo, catálogo ou cidadão informado não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 *       '409':
 *         description: Ocorrência duplicada, catálogo inativo ou conflito de vínculo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 */
export function criarCameraTransitoRoutes(controller: CameraTransitoController): Router {
  const router = Router();
  router.post('/multar', (request, response, next) => {
    controller.multar(request, response).catch(next);
  });
  return router;
}
