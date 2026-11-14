import type { MultaResponseDto } from './MultaResponseDto';

export interface ListarMultasResponseDto {
  itens: MultaResponseDto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}
