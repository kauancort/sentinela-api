export class ErroDominioCatalogoMulta extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDominioCatalogoMulta';
  }
}

export type CampoUnicoCatalogoMulta = 'codigo' | 'desconhecido';

export class ErroDuplicidadeCatalogoMulta extends ErroDominioCatalogoMulta {
  constructor(public readonly campo: CampoUnicoCatalogoMulta) {
    super(campo === 'codigo'
      ? 'Já existe um CatalogoMulta cadastrado com este código.'
      : 'Já existe um CatalogoMulta com um campo único duplicado.');
    this.name = 'ErroDuplicidadeCatalogoMulta';
  }
}

export class ErroCatalogoMultaVinculado extends ErroDominioCatalogoMulta {
  constructor() {
    super('O CatalogoMulta possui registros vinculados e não pode ser excluído.');
    this.name = 'ErroCatalogoMultaVinculado';
  }
}
