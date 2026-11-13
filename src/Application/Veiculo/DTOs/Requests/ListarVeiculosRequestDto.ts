export interface ListarVeiculosRequestDto {
  pagina?: number | string;
  tamanhoPagina?: number | string;
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: number | string;
  cor?: string;
  proprietarioId?: string;
}
