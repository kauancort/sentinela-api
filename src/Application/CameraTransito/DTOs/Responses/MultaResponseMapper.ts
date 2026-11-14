import type { Multa } from '../../../../Domain/CameraTransito/Multa';
import type { MultaResponseDto } from './MultaResponseDto';

export function mapearMultaParaResponse(multa: Multa): MultaResponseDto {
  return {
    id: multa.id,
    ocorrenciaId: multa.ocorrenciaId,
    codigoCamera: multa.codigoCamera,
    placaCapturada: multa.placaCapturada,
    veiculoId: multa.veiculoId,
    proprietarioIdNaOcorrencia: multa.proprietarioIdNaOcorrencia,
    condutorId: multa.condutorId,
    responsavelId: multa.responsavelId,
    catalogoMultaId: multa.catalogoMultaId,
    codigoInfracaoAplicado: multa.codigoInfracaoAplicado,
    descricaoInfracaoAplicada: multa.descricaoInfracaoAplicada,
    artigoCtbAplicado: multa.artigoCtbAplicado,
    gravidadeAplicada: multa.gravidadeAplicada,
    responsabilidadeAplicada: multa.responsabilidadeAplicada,
    valorAplicado: multa.valorAplicado,
    pontosAplicaveis: multa.pontosAplicaveis,
    autossuspensiva: multa.autossuspensiva,
    dataHoraOcorrencia: multa.dataHoraOcorrencia.toISOString(),
    local: multa.local,
    status: multa.status,
    motivoCancelamento: multa.motivoCancelamento
  };
}
