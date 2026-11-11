import { validarExcluirCidadao } from '../../Validator/Cidadao/ExcluirCidadaoValidator';
import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import {
  ErroCidadaoNaoEncontrado,
  propagarErroCidadao
} from '../CidadaoApplicationErrors';
import type { ExcluirCidadaoRequestDto } from '../DTOs/Requests/ExcluirCidadaoRequestDto';

export class ExcluirCidadaoHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(dto: ExcluirCidadaoRequestDto): Promise<void> {
    const id = validarExcluirCidadao(dto);
    const cidadao = await this.cidadaos.buscarPorId(id);
    if (cidadao === null) throw new ErroCidadaoNaoEncontrado(id);

    try {
      await this.cidadaos.excluir(id);
    } catch (erro) {
      propagarErroCidadao(erro);
    }
  }
}
