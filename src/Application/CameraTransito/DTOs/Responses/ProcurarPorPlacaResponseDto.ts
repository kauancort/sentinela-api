import type { VeiculoResponseDto } from '../../../Veiculo/DTOs/Responses/VeiculoResponseDto';

export interface ProcurarPorPlacaResponseDto {
  veiculo: VeiculoResponseDto;
  proprietario: { id: string; nome: string };
}
