import type { MultaResponseDto } from './MultaResponseDto';
import type { AnalisePontuacaoResponseDto } from './AnalisePontuacaoResponseDto';

export interface MultarResponseDto {
  multa: MultaResponseDto;
  analise: AnalisePontuacaoResponseDto;
  pendencias: { codigo: string; mensagem: string; proprietarioId: string }[];
}
