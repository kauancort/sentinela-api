export class ErroDominioCameraTransito extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

export class ErroDadosMultaInvalidos extends ErroDominioCameraTransito {
  constructor(public readonly campo: string, mensagem: string) {
    super(mensagem);
  }
}

export class ErroConflitoMulta extends ErroDominioCameraTransito {
  constructor(public readonly campo: string, mensagem: string) {
    super(mensagem);
  }
}

export class ErroOcorrenciaDuplicada extends ErroConflitoMulta {
  constructor(public readonly ocorrenciaId: string) {
    super('ocorrenciaId', `A ocorrência ${ocorrenciaId} já possui uma multa registrada.`);
  }
}

export class ErroMultaNaoEncontrada extends ErroDominioCameraTransito {
  constructor(public readonly id: string) {
    super(`Multa com ID ${id} não foi encontrada.`);
  }
}

export class ErroVinculoCameraTransito extends ErroDominioCameraTransito {
  constructor() {
    super('A operação não pode ser concluída por um vínculo inexistente ou restrito.');
  }
}

export class ErroCatalogoMultaInativo extends ErroDominioCameraTransito {
  constructor() {
    super('O item do catálogo está inativo e não pode gerar novas multas.');
  }
}
