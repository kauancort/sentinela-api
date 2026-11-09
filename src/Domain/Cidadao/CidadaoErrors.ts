export class ErroDominioCidadao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDominioCidadao';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroValidacaoCidadao extends ErroDominioCidadao {
  constructor(
    public readonly campo: string,
    mensagem: string
  ) {
    super(mensagem);
    this.name = 'ErroValidacaoCidadao';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
