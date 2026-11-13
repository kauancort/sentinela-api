import type { CatalogoMultaResponseDto } from './CatalogoMultaResponseDto';

export interface ListarCatalogoMultasResponseDto {
  itens: CatalogoMultaResponseDto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}
