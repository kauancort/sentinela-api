import type { TransferirPropriedadeVeiculoRequestDto } from '../../Veiculo/DTOs/Requests/TransferirPropriedadeVeiculoRequestDto';
import { validarId, validarTransferencia } from './VeiculoValidator';

export function validarTransferirPropriedadeVeiculo(
  id: unknown,
  input: unknown
): { id: string; dados: TransferirPropriedadeVeiculoRequestDto } {
  return {
    id: validarId(id),
    dados: { novoProprietarioId: validarTransferencia(input) }
  };
}
