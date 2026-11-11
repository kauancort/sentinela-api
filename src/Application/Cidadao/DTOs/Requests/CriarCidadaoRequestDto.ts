import type { CriarCidadao } from '../../../../Domain/Cidadao/Cidadao';

export interface CriarCidadaoRequestDto extends Omit<CriarCidadao, 'cnhValidade'> {
  cnhValidade?: Date | string | null;
}
