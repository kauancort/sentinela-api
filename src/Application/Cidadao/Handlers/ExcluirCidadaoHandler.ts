import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import {
  ErroCidadaoNaoEncontrado,
  propagarErroCidadao
} from '../CidadaoApplicationErrors';
import type { ExcluirCidadaoRequestDto } from '../DTOs/Requests/ExcluirCidadaoRequestDto';

export class ExcluirCidadaoHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(dto: ExcluirCidadaoRequestDto): Promise<void> {
    const cidadao = await this.cidadaos.buscarPorId(dto.id);
    if (cidadao === null) throw new ErroCidadaoNaoEncontrado(dto.id);

    try {
      await this.cidadaos.excluir(dto.id);
    } catch (erro) {
      propagarErroCidadao(erro);
    }
  }
}
