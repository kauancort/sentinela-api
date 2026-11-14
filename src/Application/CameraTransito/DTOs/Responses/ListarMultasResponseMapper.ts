import type { ResultadoListarMultas } from '../../../../Domain/CameraTransito/CameraTransitoRepository';
import type { ListarMultasResponseDto } from './ListarMultasResponseDto';
import { mapearMultaParaResponse } from './MultaResponseMapper';

export function mapearListarMultasParaResponse(resultado: ResultadoListarMultas): ListarMultasResponseDto {
  return {
    itens: resultado.itens.map(mapearMultaParaResponse),
    total: resultado.total,
    pagina: resultado.pagina,
    tamanhoPagina: resultado.limite
  };
}
