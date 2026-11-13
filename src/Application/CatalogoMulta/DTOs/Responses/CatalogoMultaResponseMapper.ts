import { CatalogoMulta } from '../../../../Domain/CatalogoMulta/CatalogoMulta';
import type { CatalogoMultaResponseDto } from './CatalogoMultaResponseDto';

export function mapearCatalogoMultaParaResponse(catalogoMulta: CatalogoMulta): CatalogoMultaResponseDto {
  return {
    id: catalogoMulta.id,
    codigo: catalogoMulta.codigo,
    descricao: catalogoMulta.descricao,
    artigoCtb: catalogoMulta.artigoCtb,
    gravidade: catalogoMulta.gravidade,
    valorBase: catalogoMulta.valorBase,
    multiplicador: catalogoMulta.multiplicador,
    geraPontos: catalogoMulta.geraPontos,
    autossuspensiva: catalogoMulta.autossuspensiva,
    responsabilidade: catalogoMulta.responsabilidade,
    ativo: catalogoMulta.ativo,
    valorCalculado: catalogoMulta.calcularValor(),
    pontosAplicaveis: catalogoMulta.obterPontosAplicaveis()
  };
}
