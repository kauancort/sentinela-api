import { Cidadao } from '../../../../Domain/Cidadao/Cidadao';
import type { CidadaoResponseDto } from './CidadaoResponseDto';

export function mapearCidadaoParaResponse(
  cidadao: Cidadao,
  possuiVeiculo?: boolean
): CidadaoResponseDto {
  const dados = cidadao.obterDados();
  return {
    ...dados,
    cnhValidade: dados.cnhValidade?.toISOString().slice(0, 10) ?? null,
    criadoEm: dados.criadoEm.toISOString(),
    atualizadoEm: dados.atualizadoEm.toISOString(),
    ...(possuiVeiculo === undefined ? {} : { possuiVeiculo })
  };
}
