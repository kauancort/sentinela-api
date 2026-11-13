import type { VeiculoResponseDto } from './VeiculoResponseDto';

export interface ListarVeiculosResponseDto {
  itens: VeiculoResponseDto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}
