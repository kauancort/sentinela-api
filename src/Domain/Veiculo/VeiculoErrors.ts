export class ErroDominioVeiculo extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDominioVeiculo';
  }
}

export type CampoUnicoVeiculo = 'placa' | 'desconhecido';

export class ErroDuplicidadeVeiculo extends ErroDominioVeiculo {
  constructor(public readonly campo: CampoUnicoVeiculo) {
    const nomeCampo = campo === 'desconhecido' ? 'um campo único' : campo;
    super(`Já existe um veículo cadastrado com ${nomeCampo}.`);
    this.name = 'ErroDuplicidadeVeiculo';
  }
}

export class ErroVeiculoNaoEncontrado extends ErroDominioVeiculo {
  constructor(public readonly id: string) {
    super(`Veículo com ID ${id} não foi encontrado.`);
    this.name = 'ErroVeiculoNaoEncontrado';
  }
}

export class ErroProprietarioVeiculoNaoEncontrado extends ErroDominioVeiculo {
  constructor(public readonly id: string) {
    super(`O proprietário com ID ${id} não foi encontrado.`);
    this.name = 'ErroProprietarioVeiculoNaoEncontrado';
  }
}

export class ErroVeiculoVinculado extends ErroDominioVeiculo {
  constructor() {
    super('O veículo possui registros vinculados e não pode ser excluído.');
    this.name = 'ErroVeiculoVinculado';
  }
}
