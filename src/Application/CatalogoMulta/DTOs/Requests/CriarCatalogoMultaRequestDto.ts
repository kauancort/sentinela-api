import type { DadosCatalogoMulta } from '../../../../Domain/CatalogoMulta/CatalogoMulta';

export type CriarCatalogoMultaRequestDto = Omit<DadosCatalogoMulta, 'multiplicador'> & {
  multiplicador?: number;
};
