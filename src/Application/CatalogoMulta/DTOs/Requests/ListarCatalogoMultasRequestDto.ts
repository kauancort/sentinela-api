export interface ListarCatalogoMultasRequestDto {
  pagina?: number | string;
  tamanhoPagina?: number | string;
  codigo?: string;
  descricao?: string;
  gravidade?: string;
  responsabilidade?: string;
  ativo?: boolean | string;
}
