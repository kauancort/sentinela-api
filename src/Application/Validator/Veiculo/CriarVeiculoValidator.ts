import type { CriarVeiculoRequestDto } from '../../Veiculo/DTOs/Requests/CriarVeiculoRequestDto';
import { validarDadosCriacao } from './VeiculoValidator';

export function validarCriarVeiculo(input: unknown): CriarVeiculoRequestDto {
  return validarDadosCriacao(input);
}
