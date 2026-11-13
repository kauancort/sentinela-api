import type { DadosCatalogoMulta } from '../../../../Domain/CatalogoMulta/CatalogoMulta';

export interface CatalogoMultaResponseDto extends DadosCatalogoMulta {
  id: string;
  valorCalculado: number;
  pontosAplicaveis: number;
}
