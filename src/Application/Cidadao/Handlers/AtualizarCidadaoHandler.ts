import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import { Cidadao } from '../../../Domain/Cidadao/Cidadao';
import {
  ErroCidadaoNaoEncontrado,
  ErroConflitoCidadao,
  propagarErroCidadao
} from '../CidadaoApplicationErrors';
import { validarAtualizarCidadao } from '../../Validator/Cidadao/AtualizarCidadaoValidator';
import type { AtualizarCidadaoRequestDto } from '../DTOs/Requests/AtualizarCidadaoRequestDto';
import type { CidadaoResponseDto } from '../DTOs/Responses/CidadaoResponseDto';
import { mapearCidadaoParaResponse } from '../DTOs/Responses/CidadaoResponseMapper';

export class AtualizarCidadaoHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(id: unknown, dto: AtualizarCidadaoRequestDto): Promise<CidadaoResponseDto> {
    const { id: cidadaoId, dados } = validarAtualizarCidadao(id, dto);
    const cidadaoAtual = await this.cidadaos.buscarPorId(cidadaoId);
    if (cidadaoAtual === null) throw new ErroCidadaoNaoEncontrado(cidadaoId);

    try {
      const cidadao = new Cidadao(cidadaoAtual, cidadaoAtual.id);
      cidadao.atualizar(dados);

      const porCpf = await this.cidadaos.buscarPorCpf(cidadao.cpf);
      if (porCpf !== null && porCpf.id !== cidadao.id) {
        throw new ErroConflitoCidadao('cpf');
      }

      if (cidadao.cnhNumero !== null) {
        const porCnh = await this.cidadaos.buscarPorCnh(cidadao.cnhNumero);
        if (porCnh !== null && porCnh.id !== cidadao.id) {
          throw new ErroConflitoCidadao('cnhNumero');
        }
      }

      await this.cidadaos.salvar(cidadao);
      return mapearCidadaoParaResponse(cidadao);
    } catch (erro) {
      propagarErroCidadao(erro);
    }
  }
}
