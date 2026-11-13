import type { PaginacaoVeiculo } from '../../../Domain/Veiculo/VeiculoRepository';
import { validarListagem } from './VeiculoValidator';

export function validarListarVeiculos(input: unknown = {}): PaginacaoVeiculo {
  return validarListagem(input);
}
