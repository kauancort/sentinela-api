import { validarExcluirVeiculo } from '../../Validator/Veiculo/ExcluirVeiculoValidator';
import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import {
  ErroVeiculoNaoEncontrado,
  propagarErroVeiculo
} from '../VeiculoApplicationErrors';
import type { ExcluirVeiculoRequestDto } from '../DTOs/Requests/ExcluirVeiculoRequestDto';

export class ExcluirVeiculoHandler {
  constructor(private readonly veiculos: VeiculoRepository) {}

  async execute(dto: ExcluirVeiculoRequestDto): Promise<void> {
    const id = validarExcluirVeiculo(dto);
    const veiculo = await this.veiculos.buscarPorId(id);
    if (veiculo === null) throw new ErroVeiculoNaoEncontrado(id);

    try {
      await this.veiculos.excluir(id);
    } catch (erro) {
      propagarErroVeiculo(erro);
    }
  }
}
