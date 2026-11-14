import type { DadosMulta } from '../../../../Domain/CameraTransito/Multa';

export interface MultaResponseDto extends Omit<DadosMulta, 'dataHoraOcorrencia'> {
  id: string;
  dataHoraOcorrencia: string;
}
