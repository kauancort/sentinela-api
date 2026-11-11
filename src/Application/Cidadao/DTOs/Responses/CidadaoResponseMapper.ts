import { Cidadao } from '../../../../Domain/Cidadao/Cidadao';
import type { CidadaoResponseDto } from './CidadaoResponseDto';

export function mapearCidadaoParaResponse(
  cidadao: Cidadao,
  possuiVeiculo?: boolean
): CidadaoResponseDto {
  const dados = cidadao;
  return {
    ...dados,
    cnhValidade: dados.cnhValidade?.toISOString().slice(0, 10) ?? null,
    ...(possuiVeiculo === undefined ? {} : { possuiVeiculo })
  };
}
