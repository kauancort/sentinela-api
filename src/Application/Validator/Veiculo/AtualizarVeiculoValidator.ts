import type { AtualizarVeiculoRequestDto } from '../../Veiculo/DTOs/Requests/AtualizarVeiculoRequestDto';
import { validarDadosAtualizacao, validarId } from './VeiculoValidator';

export function validarAtualizarVeiculo(
  id: unknown,
  input: unknown
): { id: string; dados: AtualizarVeiculoRequestDto } {
  return { id: validarId(id), dados: validarDadosAtualizacao(input) };
}
