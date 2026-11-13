import {
  ErroCatalogoMultaVinculado,
  ErroDuplicidadeCatalogoMulta,
  type CampoUnicoCatalogoMulta
} from '../../Domain/CatalogoMulta/CatalogoMultaErrors';

export type CodigoErroAplicacaoCatalogoMulta =
  | 'CATALOGO_MULTA_DADOS_INVALIDOS'
  | 'CATALOGO_MULTA_NAO_ENCONTRADO'
  | 'CATALOGO_MULTA_CONFLITO';

export class ErroAplicacaoCatalogoMulta extends Error {
  constructor(
    public readonly codigo: CodigoErroAplicacaoCatalogoMulta,
    mensagem: string,
    public readonly campo?: string
  ) {
    super(mensagem);
    this.name = 'ErroAplicacaoCatalogoMulta';
  }
}

export class ErroDadosCatalogoMultaInvalidos extends ErroAplicacaoCatalogoMulta {
  constructor(campo: string, mensagem: string) {
    super('CATALOGO_MULTA_DADOS_INVALIDOS', mensagem, campo);
    this.name = 'ErroDadosCatalogoMultaInvalidos';
  }
}

export class ErroCatalogoMultaNaoEncontrado extends ErroAplicacaoCatalogoMulta {
  constructor(id: string) {
    super('CATALOGO_MULTA_NAO_ENCONTRADO', `CatalogoMulta com ID ${id} não foi encontrado.`, 'id');
    this.name = 'ErroCatalogoMultaNaoEncontrado';
  }
}

export class ErroConflitoCatalogoMulta extends ErroAplicacaoCatalogoMulta {
  constructor(campo: CampoUnicoCatalogoMulta | 'vinculo', mensagem?: string) {
    const mensagens = {
      codigo: 'Já existe um CatalogoMulta cadastrado com este código.',
      desconhecido: 'Já existe um CatalogoMulta com um campo único duplicado.',
      vinculo: 'O CatalogoMulta possui registros vinculados e não pode ser excluído.'
    };
    super('CATALOGO_MULTA_CONFLITO', mensagem ?? mensagens[campo], campo);
    this.name = 'ErroConflitoCatalogoMulta';
  }
}

export function propagarErroCatalogoMulta(erro: unknown): never {
  if (erro instanceof ErroDuplicidadeCatalogoMulta) {
    throw new ErroConflitoCatalogoMulta(erro.campo, erro.message);
  }
  if (erro instanceof ErroCatalogoMultaVinculado) {
    throw new ErroConflitoCatalogoMulta('vinculo', erro.message);
  }
  throw erro;
}
