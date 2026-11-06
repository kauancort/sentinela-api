import { SimulacaoAplicacaoMultaRepository } from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';
import { ListarSimulacoesResponseDTO } from './dto/ListarSimulacoesResponse.dto';

export class ListarSimulacoesHandler {
  constructor(private readonly repositorio: SimulacaoAplicacaoMultaRepository) {}

  public async executar(): Promise<ListarSimulacoesResponseDTO> {
    const lista = await this.repositorio.listar();
    return lista;
  }
}

