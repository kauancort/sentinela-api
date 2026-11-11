import type { ErrorRequestHandler } from 'express';

import { ErroAplicacaoCidadao } from '../../Application/Cidadao/CidadaoApplicationErrors';

const STATUS_POR_CODIGO = {
  CIDADAO_DADOS_INVALIDOS: 400,
  CIDADAO_NAO_ENCONTRADO: 404,
  CIDADAO_CONFLITO: 409
} as const;

function erroDeJsonMalformado(erro: unknown): boolean {
  if (!(erro instanceof SyntaxError)) return false;
  const erroComStatus = erro as SyntaxError & { status?: number; type?: string };
  return erroComStatus.status === 400 && erroComStatus.type === 'entity.parse.failed';
}

export const cidadaoErrorHandler: ErrorRequestHandler = (erro, _request, response, next) => {
  if (response.headersSent) return next(erro);

  if (erro instanceof ErroAplicacaoCidadao) {
    const campo = erro.campo === undefined ? {} : { campo: erro.campo };
    return response.status(STATUS_POR_CODIGO[erro.codigo]).json({
      erro: {
        codigo: erro.codigo,
        mensagem: erro.message,
        ...campo
      }
    });
  }

  if (erroDeJsonMalformado(erro)) {
    return response.status(400).json({
      erro: {
        codigo: 'CIDADAO_DADOS_INVALIDOS',
        mensagem: 'O corpo da requisição deve conter JSON válido.',
        campo: 'body'
      }
    });
  }

  // Falhas não mapeadas continuam usando o tratamento padrão do Express.
  return next(erro);
};
