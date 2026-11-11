import type { DadosCidadao } from '../../../../Domain/Cidadao/Cidadao';

export interface CidadaoResponseDto extends Omit<DadosCidadao, 'cnhValidade'> {
  id: string;
  cnhValidade: string | null;
  /** Preenchido pelo módulo que carregar a relação com Veículo. */
  possuiVeiculo?: boolean;
}
