import {
  ErroCatalogoMultaInativo, ErroConflitoMulta, ErroDadosMultaInvalidos,
  ErroMultaNaoEncontrada, ErroOcorrenciaDuplicada, ErroVinculoCameraTransito
} from '../../Domain/CameraTransito/CameraTransitoErrors';

export type CodigoErroCameraTransito = 'CAMERA_TRANSITO_DADOS_INVALIDOS' | 'CAMERA_TRANSITO_NAO_ENCONTRADO'
  | 'CAMERA_TRANSITO_OCORRENCIA_DUPLICADA' | 'CAMERA_TRANSITO_CONFLITO';

export class ErroAplicacaoCameraTransito extends Error {
  constructor(public readonly codigo: CodigoErroCameraTransito, mensagem: string, public readonly campo?: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

export class ErroDadosCameraTransitoInvalidos extends ErroAplicacaoCameraTransito {
  constructor(campo: string, mensagem: string) {
    super('CAMERA_TRANSITO_DADOS_INVALIDOS', mensagem, campo);
  }
}

export class ErroRegistroCameraTransitoNaoEncontrado extends ErroAplicacaoCameraTransito {
  constructor(campo: string, mensagem: string) {
    super('CAMERA_TRANSITO_NAO_ENCONTRADO', mensagem, campo);
  }
}

export function propagarErroCameraTransito(erro: unknown): never {
  if (erro instanceof ErroDadosMultaInvalidos) throw new ErroDadosCameraTransitoInvalidos(erro.campo, erro.message);
  if (erro instanceof ErroMultaNaoEncontrada) throw new ErroRegistroCameraTransitoNaoEncontrado('id', erro.message);
  if (erro instanceof ErroOcorrenciaDuplicada) {
    throw new ErroAplicacaoCameraTransito('CAMERA_TRANSITO_OCORRENCIA_DUPLICADA', erro.message, erro.campo);
  }
  if (erro instanceof ErroConflitoMulta || erro instanceof ErroCatalogoMultaInativo || erro instanceof ErroVinculoCameraTransito) {
    const campo = erro instanceof ErroConflitoMulta ? erro.campo : erro instanceof ErroCatalogoMultaInativo ? 'catalogoMultaId' : 'vinculo';
    throw new ErroAplicacaoCameraTransito('CAMERA_TRANSITO_CONFLITO', erro.message, campo);
  }
  throw erro;
}
