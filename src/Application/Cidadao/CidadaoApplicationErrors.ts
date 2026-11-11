import {
  ErroCidadaoVinculado,
  ErroDuplicidadeCidadao,
  ErroValidacaoCidadao,
  type CampoUnicoCidadao
} from '../../Domain/Cidadao/CidadaoErrors';

export type CodigoErroAplicacaoCidadao =
  | 'CIDADAO_DADOS_INVALIDOS'
  | 'CIDADAO_NAO_ENCONTRADO'
  | 'CIDADAO_CONFLITO';

export type CampoConflitoCidadao = CampoUnicoCidadao | 'vinculo';

export class ErroAplicacaoCidadao extends Error {
  constructor(
    public readonly codigo: CodigoErroAplicacaoCidadao,
    mensagem: string,
    public readonly campo?: string
  ) {
    super(mensagem);
    this.name = 'ErroAplicacaoCidadao';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroDadosCidadaoInvalidos extends ErroAplicacaoCidadao {
  constructor(campo: string, mensagem: string) {
    super('CIDADAO_DADOS_INVALIDOS', mensagem, campo);
    this.name = 'ErroDadosCidadaoInvalidos';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroCidadaoNaoEncontrado extends ErroAplicacaoCidadao {
  constructor(id: string) {
    super('CIDADAO_NAO_ENCONTRADO', `Cidadão com ID ${id} não foi encontrado.`, 'id');
    this.name = 'ErroCidadaoNaoEncontrado';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroConflitoCidadao extends ErroAplicacaoCidadao {
  constructor(campo: CampoConflitoCidadao, mensagem?: string) {
    const mensagens: Record<CampoConflitoCidadao, string> = {
      cpf: 'Já existe um cidadão cadastrado com este CPF.',
      cnhNumero: 'Já existe um cidadão cadastrado com este número de CNH.',
      desconhecido: 'Já existe um cidadão com um campo único duplicado.',
      vinculo: 'O cidadão possui registros vinculados e não pode ser excluído.'
    };
    super('CIDADAO_CONFLITO', mensagem ?? mensagens[campo], campo);
    this.name = 'ErroConflitoCidadao';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Converte erros de domínio/persistência para o formato estável da Application. */
export function propagarErroCidadao(erro: unknown): never {
  if (erro instanceof ErroValidacaoCidadao) {
    throw new ErroDadosCidadaoInvalidos(erro.campo, erro.message);
  }
  if (erro instanceof ErroDuplicidadeCidadao) {
    throw new ErroConflitoCidadao(erro.campo, erro.message);
  }
  if (erro instanceof ErroCidadaoVinculado) {
    throw new ErroConflitoCidadao('vinculo', erro.message);
  }
  throw erro;
}
