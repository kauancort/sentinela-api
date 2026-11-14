import type { Cidadao } from '../../../../Domain/Cidadao/Cidadao';
import type { Veiculo } from '../../../../Domain/Veiculo/Veiculo';
import { mapearVeiculoParaResponse } from '../../../Veiculo/DTOs/Responses/VeiculoResponseMapper';
import type { ProcurarPorPlacaResponseDto } from './ProcurarPorPlacaResponseDto';

export function mapearProcurarPorPlacaParaResponse(veiculo: Veiculo, proprietario: Pick<Cidadao, 'id' | 'nome'>): ProcurarPorPlacaResponseDto {
  return {
    veiculo: mapearVeiculoParaResponse(veiculo),
    proprietario: { id: proprietario.id, nome: proprietario.nome }
  };
}
