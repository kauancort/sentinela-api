import {
  ErroDuplicidadeVeiculo,
  ErroVeiculoVinculado,
  type CampoUnicoVeiculo
} from '../../Domain/Veiculo/VeiculoErrors';

export type CodigoErroAplicacaoVeiculo =
  | 'VEICULO_DADOS_INVALIDOS'
  | 'VEICULO_NAO_ENCONTRADO'
  | 'VEICULO_PROPRIETARIO_NAO_ENCONTRADO'
  | 'VEICULO_CONFLITO';

export type CampoConflitoVeiculo = CampoUnicoVeiculo | 'vinculo';

export class ErroAplicacaoVeiculo extends Error {
  constructor(
    public readonly codigo: CodigoErroAplicacaoVeiculo,
    mensagem: string,
    public readonly campo?: string
  ) {
    super(mensagem);
    this.name = 'ErroAplicacaoVeiculo';
  }
}

export class ErroDadosVeiculoInvalidos extends ErroAplicacaoVeiculo {
  constructor(campo: string, mensagem: string) {
    super('VEICULO_DADOS_INVALIDOS', mensagem, campo);
    this.name = 'ErroDadosVeiculoInvalidos';
  }
}

export class ErroVeiculoNaoEncontrado extends ErroAplicacaoVeiculo {
  constructor(id: string) {
    super('VEICULO_NAO_ENCONTRADO', `Veículo com ID ${id} não foi encontrado.`, 'id');
    this.name = 'ErroVeiculoNaoEncontrado';
  }
}

export class ErroProprietarioVeiculoNaoEncontrado extends ErroAplicacaoVeiculo {
  constructor(id: string) {
    super(
      'VEICULO_PROPRIETARIO_NAO_ENCONTRADO',
      `O proprietário com ID ${id} não foi encontrado.`,
      'proprietarioId'
    );
    this.name = 'ErroProprietarioVeiculoNaoEncontrado';
  }
}

export class ErroConflitoVeiculo extends ErroAplicacaoVeiculo {
  constructor(campo: CampoConflitoVeiculo, mensagem?: string) {
    const mensagens: Record<CampoConflitoVeiculo, string> = {
      placa: 'Já existe um veículo cadastrado com esta placa.',
      desconhecido: 'Já existe um veículo com um campo único duplicado.',
      vinculo: 'O veículo possui registros vinculados e não pode ser excluído.'
    };
    super('VEICULO_CONFLITO', mensagem ?? mensagens[campo], campo);
    this.name = 'ErroConflitoVeiculo';
  }
}

/** Converte erros de domínio/persistência para o formato estável da Application. */
export function propagarErroVeiculo(erro: unknown): never {
  if (erro instanceof ErroDuplicidadeVeiculo) {
    throw new ErroConflitoVeiculo(erro.campo, erro.message);
  }
  if (erro instanceof ErroVeiculoVinculado) {
    throw new ErroConflitoVeiculo('vinculo', erro.message);
  }
  throw erro;
}
