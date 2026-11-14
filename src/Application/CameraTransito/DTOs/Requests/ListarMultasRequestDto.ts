export interface ListarMultasRequestDto {
  pagina?: number | string;
  tamanhoPagina?: number | string;
  placa?: string;
  codigoCamera?: string;
  catalogoMultaId?: string;
  condutorId?: string;
  responsavelId?: string;
  status?: string;
  gravidade?: string;
  dataInicial?: string;
  dataFinal?: string;
}
