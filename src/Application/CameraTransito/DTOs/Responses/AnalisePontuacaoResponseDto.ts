import type { AnalisePontuacao } from '../../../../Domain/CameraTransito/PoliticaPontuacao';

export interface AnalisePontuacaoResponseDto extends Omit<AnalisePontuacao, 'dataReferencia'> {
  dataReferencia: string;
}
