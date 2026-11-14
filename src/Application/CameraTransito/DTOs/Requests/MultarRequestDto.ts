export interface MultarRequestDto {
  ocorrenciaId: string;
  codigoCamera: string;
  placa: string;
  catalogoMultaId: string;
  condutorId?: string | null;
  dataHoraOcorrencia: string;
  local: string;
}
