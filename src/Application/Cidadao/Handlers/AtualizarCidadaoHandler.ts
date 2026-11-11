import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import { Cidadao } from '../../../Domain/Cidadao/Cidadao';
import {
  ErroCidadaoNaoEncontrado,
  ErroConflitoCidadao,
  propagarErroCidadao
} from '../CidadaoApplicationErrors';
import { converterAtualizarCidadaoRequest } from '../DTOs/Requests/CidadaoRequestMapper';
import type { AtualizarCidadaoRequestDto } from '../DTOs/Requests/AtualizarCidadaoRequestDto';
import type { CidadaoResponseDto } from '../DTOs/Responses/CidadaoResponseDto';
import { mapearCidadaoParaResponse } from '../DTOs/Responses/CidadaoResponseMapper';

export class AtualizarCidadaoHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(id: string, dto: AtualizarCidadaoRequestDto): Promise<CidadaoResponseDto> {
    const cidadaoAtual = await this.cidadaos.buscarPorId(id);
    if (cidadaoAtual === null) throw new ErroCidadaoNaoEncontrado(id);

    try {
      const cidadao = Cidadao.reconstituir(cidadaoAtual.obterDados());
      // DTO completo: a entidade valida o estado final antes de qualquer gravação.
      cidadao.atualizar(converterAtualizarCidadaoRequest(dto));

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
