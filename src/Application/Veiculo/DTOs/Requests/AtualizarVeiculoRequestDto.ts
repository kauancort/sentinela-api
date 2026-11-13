import type { DadosVeiculo } from '../../../../Domain/Veiculo/Veiculo';

export interface AtualizarVeiculoRequestDto
  extends Pick<DadosVeiculo, 'marca' | 'modelo' | 'ano' | 'cor'> {}
