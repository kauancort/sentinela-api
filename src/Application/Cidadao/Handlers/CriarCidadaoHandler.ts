import { Cidadao } from '../../../Domain/Cidadao/Cidadao';
import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import {
  ErroConflitoCidadao,
  propagarErroCidadao
} from '../CidadaoApplicationErrors';
import { validarCriarCidadao } from '../../Validator/Cidadao/CriarCidadaoValidator';
import type { CriarCidadaoRequestDto } from '../DTOs/Requests/CriarCidadaoRequestDto';
import type { CidadaoResponseDto } from '../DTOs/Responses/CidadaoResponseDto';
import { mapearCidadaoParaResponse } from '../DTOs/Responses/CidadaoResponseMapper';

export class CriarCidadaoHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(dto: CriarCidadaoRequestDto): Promise<CidadaoResponseDto> {
    try {
      const cidadao = Cidadao.criar(validarCriarCidadao(dto));
      await this.validarUnicidade(cidadao);
      await this.cidadaos.salvar(cidadao);
      return mapearCidadaoParaResponse(cidadao);
    } catch (erro) {
      propagarErroCidadao(erro);
    }
  }

  private async validarUnicidade(cidadao: Cidadao): Promise<void> {
    const porCpf = await this.cidadaos.buscarPorCpf(cidadao.cpf);
    if (porCpf !== null) throw new ErroConflitoCidadao('cpf');

    if (cidadao.cnhNumero !== null) {
      const porCnh = await this.cidadaos.buscarPorCnh(cidadao.cnhNumero);
      if (porCnh !== null) throw new ErroConflitoCidadao('cnhNumero');
    }
  }
}
