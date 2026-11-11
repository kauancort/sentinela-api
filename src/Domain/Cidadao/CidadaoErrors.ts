export class ErroDominioCidadao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDominioCidadao';
  }
}

export type CampoUnicoCidadao = 'cpf' | 'cnhNumero' | 'desconhecido';

export class ErroDuplicidadeCidadao extends ErroDominioCidadao {
  constructor(public readonly campo: CampoUnicoCidadao) {
    const nomeCampo = campo === 'desconhecido' ? 'um campo único' : campo;
    super(`Já existe um cidadão cadastrado com ${nomeCampo}.`);
    this.name = 'ErroDuplicidadeCidadao';
  }
}

export class ErroCidadaoVinculado extends ErroDominioCidadao {
  constructor() {
    super('O cidadão possui registros vinculados e não pode ser excluído.');
    this.name = 'ErroCidadaoVinculado';
  }
}
