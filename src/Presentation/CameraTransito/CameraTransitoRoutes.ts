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
 * /camera-transito/procurarPorPlaca:
 *   get:
 *     summary: Busca veículo e proprietário atual pela placa
 *     tags: [CameraTransito]
 *     description: >-
 *       Normaliza a placa como no cadastro de Veículo. Retorna somente id e nome do proprietário atual,
 *       sem inferir condutor nem carregar histórico. Consulte /camera-transito/multas com filtro placa para ver as multas.
 *     parameters:
 *       - in: query
 *         name: placa
 *         required: true
 *         description: Placa antiga ou Mercosul; aceita minúsculas, espaços e hífen para normalização.
 *         schema: { type: string, example: ABC-1234 }
 *     responses:
 *       '200':
 *         description: Veículo e dados básicos do proprietário atual
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProcurarPorPlacaResponse' }
 *       '400':
 *         description: Placa ausente, inválida, repetida ou parâmetro desconhecido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 *       '404':
 *         description: Veículo ou proprietário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 * /camera-transito/multas:
 *   get:
 *     summary: Lista multas com paginação e filtros combinados
 *     tags: [CameraTransito]
 *     description: >-
 *       Filtros exatos combinados por E. Inclui canceladas por padrão. Placa e código da câmera são normalizados.
 *       Datas reais ISO 8601 com fuso e até milissegundos; intervalo inclusivo, sem exigir ambas as datas.
 *       Ordem por data da ocorrência decrescente e ID crescente para desempate.
 *       Retorna snapshots, status e motivo de cancelamento, sem recalcular valores pelo catálogo atual ou projetar pontuação.
 *       Página e deslocamento (pagina menos 1 vezes tamanhoPagina) devem ser inteiros seguros.
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, minimum: 1, maximum: 9007199254740991, default: 1 } }
 *       - { in: query, name: tamanhoPagina, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: placa, schema: { type: string, example: ABC1D23 } }
 *       - { in: query, name: codigoCamera, schema: { type: string, minLength: 1, maxLength: 50, example: CAM-001 } }
 *       - { in: query, name: catalogoMultaId, schema: { type: string, format: uuid } }
 *       - { in: query, name: condutorId, schema: { type: string, format: uuid } }
 *       - { in: query, name: responsavelId, schema: { type: string, format: uuid } }
 *       - { in: query, name: status, schema: { type: string, enum: [REGISTRADA, AGUARDANDO_IDENTIFICACAO, CANCELADA] } }
 *       - { in: query, name: gravidade, schema: { type: string, enum: [LEVE, MEDIA, GRAVE, GRAVISSIMA] } }
 *       - { in: query, name: dataInicial, description: 'Início inclusivo; ano entre 1000 e 9999.', schema: { type: string, format: date-time, example: '2026-11-01T00:00:00-03:00' } }
 *       - { in: query, name: dataFinal, description: 'Fim inclusivo; igual ou posterior ao início.', schema: { type: string, format: date-time, example: '2026-11-13T23:59:59.999-03:00' } }
 *     responses:
 *       '200':
 *         description: Página de multas, incluindo página vazia e total filtrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ListarMultasResponse' }
 *       '400':
 *         description: Paginação ou deslocamento inválido, filtro inválido, repetido ou desconhecido, data sem fuso ou intervalo invertido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 * /camera-transito/multas/{id}:
 *   delete:
 *     summary: Cancela logicamente uma multa por erro de fiscalização
 *     tags: [CameraTransito]
 *     description: >-
 *       Não recebe body. Mantém a multa e seus snapshots no histórico, altera o status para CANCELADA
 *       e grava o motivo fixo "Cancelamento por erro de fiscalização.".
 *       Primeira chamada e repetições, inclusive concorrentes, retornam 204 sem corpo.
 *       A multa deixa de contribuir para pontos e gravíssimas nas próximas análises.
 *       Não altera CNH, respostas de análises anteriores ou vínculos que impedem excluir os cadastros relacionados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, example: '550e8400-e29b-41d4-a716-446655440001' }
 *     responses:
 *       '204':
 *         description: Multa cancelada ou já cancelada; resposta sem corpo
 *       '400':
 *         description: UUID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 *             example: { erro: { codigo: CAMERA_TRANSITO_DADOS_INVALIDOS, mensagem: 'id deve ser um UUID válido.', campo: id } }
 *       '404':
 *         description: Multa inexistente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CameraTransitoErrorResponse' }
 *             example: { erro: { codigo: CAMERA_TRANSITO_NAO_ENCONTRADO, mensagem: 'Multa com ID 550e8400-e29b-41d4-a716-446655440001 não foi encontrada.', campo: id } }
 */
export function criarCameraTransitoRoutes(controller: CameraTransitoController): Router {
  const router = Router();
  router.post('/multar', (request, response, next) => {
    controller.multar(request, response).catch(next);
  });
  router.get('/procurarPorPlaca', (request, response, next) => {
    controller.procurarPorPlaca(request, response).catch(next);
  });
  router.get('/multas', (request, response, next) => {
    controller.listarMultas(request, response).catch(next);
  });
  router.delete('/multas/:id', (request, response, next) => {
    controller.cancelarMulta(request, response).catch(next);
  });
  return router;
}
