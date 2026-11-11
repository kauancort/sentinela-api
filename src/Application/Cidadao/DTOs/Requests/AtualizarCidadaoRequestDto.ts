import type { DadosCidadao } from '../../../../Domain/Cidadao/Cidadao';

/** Todos os dados editáveis são enviados; campos de CNH podem ser nulos sem habilitação. */
export interface AtualizarCidadaoRequestDto extends Omit<DadosCidadao, 'cnhValidade'> {
  cnhValidade: Date | string | null;
}
