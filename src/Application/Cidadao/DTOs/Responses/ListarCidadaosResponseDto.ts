import type { CidadaoResponseDto } from './CidadaoResponseDto';

export interface ListarCidadaosResponseDto {
  itens: CidadaoResponseDto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}
