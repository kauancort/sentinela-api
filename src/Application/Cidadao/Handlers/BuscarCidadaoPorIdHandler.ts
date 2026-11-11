import { validarBuscarCidadaoPorId } from '../../Validator/Cidadao/BuscarCidadaoPorIdValidator';
import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import { ErroCidadaoNaoEncontrado } from '../CidadaoApplicationErrors';
import type { BuscarCidadaoPorIdRequestDto } from '../DTOs/Requests/BuscarCidadaoPorIdRequestDto';
import type { CidadaoResponseDto } from '../DTOs/Responses/CidadaoResponseDto';
import { mapearCidadaoParaResponse } from '../DTOs/Responses/CidadaoResponseMapper';

export class BuscarCidadaoPorIdHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(dto: BuscarCidadaoPorIdRequestDto): Promise<CidadaoResponseDto> {
    const id = validarBuscarCidadaoPorId(dto);
    const cidadao = await this.cidadaos.buscarPorId(id);
    if (cidadao === null) throw new ErroCidadaoNaoEncontrado(id);
    return mapearCidadaoParaResponse(cidadao);
  }
}
