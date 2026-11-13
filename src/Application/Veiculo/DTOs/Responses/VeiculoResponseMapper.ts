import type { Veiculo } from '../../../../Domain/Veiculo/Veiculo';
import type { VeiculoResponseDto } from './VeiculoResponseDto';

export function mapearVeiculoParaResponse(veiculo: Veiculo): VeiculoResponseDto {
  return {
    id: veiculo.id,
    placa: veiculo.placa,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano,
    cor: veiculo.cor,
    proprietarioId: veiculo.proprietarioId
  };
}
