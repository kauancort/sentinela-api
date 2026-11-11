import type { AtualizarCidadao } from '../../../../Domain/Cidadao/Cidadao';
import type { CriarCidadao } from '../../../../Domain/Cidadao/Cidadao';
import type { AtualizarCidadaoRequestDto } from './AtualizarCidadaoRequestDto';
import type { CriarCidadaoRequestDto } from './CriarCidadaoRequestDto';

function converterDataSemHorario(data: Date | string | null | undefined): Date | null | undefined {
  if (data === undefined || data === null) return data;

  if (data instanceof Date) {
    if (!Number.isFinite(data.getTime())) return new Date(Number.NaN);
    return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return new Date(Number.NaN);
  const dataConvertida = new Date(`${data}T00:00:00.000Z`);
  if (
    !Number.isFinite(dataConvertida.getTime()) ||
    dataConvertida.toISOString().slice(0, 10) !== data
  ) {
    return new Date(Number.NaN);
  }
  return dataConvertida;
}

export function converterCriarCidadaoRequest(dto: CriarCidadaoRequestDto): CriarCidadao {
  return {
    ...dto,
    cnhValidade: converterDataSemHorario(dto.cnhValidade)
  };
}

export function converterAtualizarCidadaoRequest(
  dto: AtualizarCidadaoRequestDto
): AtualizarCidadao {
  return {
    ...dto,
    cnhValidade: converterDataSemHorario(dto.cnhValidade)
  };
}
