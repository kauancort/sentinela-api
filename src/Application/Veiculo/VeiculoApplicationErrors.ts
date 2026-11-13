export type CodigoErroAplicacaoVeiculo = 'VEICULO_DADOS_INVALIDOS';

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
