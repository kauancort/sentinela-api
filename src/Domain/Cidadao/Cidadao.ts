import { randomUUID } from 'node:crypto';

import { ErroValidacaoCidadao } from './CidadaoErrors';

export enum SituacaoCnh {
  SEM_HABILITACAO = 'SEM_HABILITACAO',
  REGULAR = 'REGULAR',
  SUSPENSA = 'SUSPENSA',
  CASSADA = 'CASSADA'
}

export interface DadosCidadao {
  nome: string;
  cpf: string;
  email: string;
  possuiCnh: boolean;
  cnhNumero: string | null;
  cnhValidade: Date | null;
  situacaoCnh: SituacaoCnh;
  motivoSituacaoCnh: string | null;
  exerceAtividadeRemunerada: boolean;
}

export type CriarCidadao = Omit<
  DadosCidadao,
  | 'cnhNumero'
  | 'cnhValidade'
  | 'situacaoCnh'
  | 'motivoSituacaoCnh'
  | 'exerceAtividadeRemunerada'
> &
  Partial<
    Pick<
      DadosCidadao,
      | 'cnhNumero'
      | 'cnhValidade'
      | 'situacaoCnh'
      | 'motivoSituacaoCnh'
      | 'exerceAtividadeRemunerada'
    >
  >;

export type AtualizarCidadao = Partial<DadosCidadao>;

export interface CidadaoPersistido extends DadosCidadao {
  id: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const CPF_SEM_MASCARA = /^\d{11}$/;
const CPF_COM_MASCARA = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function erro(campo: string, mensagem: string): never {
  throw new ErroValidacaoCidadao(campo, mensagem);
}

function validarCpf(cpfInformado: string): string {
  if (typeof cpfInformado !== 'string') {
    return erro('cpf', 'O CPF deve ser informado como texto.');
  }

  const cpf = cpfInformado.trim();
  if (!CPF_SEM_MASCARA.test(cpf) && !CPF_COM_MASCARA.test(cpf)) {
    return erro('cpf', 'O CPF deve conter 11 dígitos, com ou sem máscara.');
  }

  const digitos = cpf.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(digitos)) {
    return erro('cpf', 'O CPF não pode conter todos os dígitos iguais.');
  }

  const calcularDigito = (base: string, pesoInicial: number): number => {
    const soma = [...base].reduce(
      (total, digito, indice) => total + Number(digito) * (pesoInicial - indice),
      0
    );
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(digitos.slice(0, 9), 10);
  const segundoDigito = calcularDigito(digitos.slice(0, 10), 11);
  if (
    primeiroDigito !== Number(digitos[9]) ||
    segundoDigito !== Number(digitos[10])
  ) {
    return erro('cpf', 'O CPF informado é inválido.');
  }

  return digitos;
}

function normalizarDados(input: CriarCidadao | DadosCidadao): DadosCidadao {
  if (typeof input.nome !== 'string' || input.nome.trim().length === 0) {
    return erro('nome', 'O nome é obrigatório.');
  }

  const nome = input.nome.trim();
  const cpf = validarCpf(input.cpf);

  if (typeof input.email !== 'string' || !EMAIL.test(input.email.trim())) {
    return erro('email', 'O e-mail informado é inválido.');
  }

  if (typeof input.possuiCnh !== 'boolean') {
    return erro('possuiCnh', 'Informe se o cidadão possui CNH.');
  }

  if (
    input.exerceAtividadeRemunerada !== undefined &&
    typeof input.exerceAtividadeRemunerada !== 'boolean'
  ) {
    return erro(
      'exerceAtividadeRemunerada',
      'O indicador de atividade remunerada deve ser booleano.'
    );
  }

  if (!input.possuiCnh) {
    return {
      nome,
      cpf,
      email: input.email.trim(),
      possuiCnh: false,
      cnhNumero: null,
      cnhValidade: null,
      situacaoCnh: SituacaoCnh.SEM_HABILITACAO,
      motivoSituacaoCnh: null,
      exerceAtividadeRemunerada: false
    };
  }

  if (typeof input.cnhNumero !== 'string' || input.cnhNumero.trim().length === 0) {
    return erro('cnhNumero', 'O número da CNH é obrigatório para quem possui habilitação.');
  }

  if (!(input.cnhValidade instanceof Date) || !Number.isFinite(input.cnhValidade.getTime())) {
    return erro('cnhValidade', 'A validade da CNH deve ser uma data válida.');
  }

  const situacoesComCnh = [
    SituacaoCnh.REGULAR,
    SituacaoCnh.SUSPENSA,
    SituacaoCnh.CASSADA
  ];
  if (!situacoesComCnh.includes(input.situacaoCnh as SituacaoCnh)) {
    return erro(
      'situacaoCnh',
      'Quem possui CNH deve estar com situação regular, suspensa ou cassada.'
    );
  }

  const motivoInformado = input.motivoSituacaoCnh;
  const exigeMotivo =
    input.situacaoCnh === SituacaoCnh.SUSPENSA ||
    input.situacaoCnh === SituacaoCnh.CASSADA;
  const motivo = typeof motivoInformado === 'string' ? motivoInformado.trim() : '';
  if (exigeMotivo && motivo.length === 0) {
    return erro('motivoSituacaoCnh', 'Informe o motivo da suspensão ou cassação da CNH.');
  }

  return {
    nome,
    cpf,
    email: input.email.trim(),
    possuiCnh: true,
    cnhNumero: input.cnhNumero.trim(),
    cnhValidade: new Date(input.cnhValidade.getTime()),
    situacaoCnh: input.situacaoCnh as SituacaoCnh,
    motivoSituacaoCnh: exigeMotivo ? motivo : null,
    exerceAtividadeRemunerada: input.exerceAtividadeRemunerada ?? false
  };
}

function clonarData(data: Date | null): Date | null {
  return data === null ? null : new Date(data.getTime());
}

export class Cidadao {
  private constructor(
    private dadosAtuais: DadosCidadao,
    private readonly identificador: string,
    private dataCriacao: Date,
    private dataAtualizacao: Date
  ) {}

  static criar(input: CriarCidadao): Cidadao {
    const dadosValidados = normalizarDados(input);
    const agora = new Date();
    return new Cidadao(dadosValidados, randomUUID(), agora, agora);
  }

  static reconstituir(input: CidadaoPersistido): Cidadao {
    if (typeof input.id !== 'string' || !UUID.test(input.id)) {
      return erro('id', 'O identificador do cidadão deve ser um UUID válido.');
    }
    if (!(input.criadoEm instanceof Date) || !Number.isFinite(input.criadoEm.getTime())) {
      return erro('criadoEm', 'A data de criação deve ser válida.');
    }
    if (!(input.atualizadoEm instanceof Date) || !Number.isFinite(input.atualizadoEm.getTime())) {
      return erro('atualizadoEm', 'A data de atualização deve ser válida.');
    }

    return new Cidadao(
      normalizarDados(input),
      input.id,
      new Date(input.criadoEm.getTime()),
      new Date(input.atualizadoEm.getTime())
    );
  }

  atualizar(input: AtualizarCidadao): void {
    const dadosFinais = normalizarDados({ ...this.dadosAtuais, ...input });
    const atualizadoEm = new Date();

    // A entidade só muda depois que o estado completo passou por todas as validações.
    this.dadosAtuais = dadosFinais;
    this.dataAtualizacao = atualizadoEm;
  }

  get id(): string {
    return this.identificador;
  }

  get nome(): string {
    return this.dadosAtuais.nome;
  }

  get cpf(): string {
    return this.dadosAtuais.cpf;
  }

  get email(): string {
    return this.dadosAtuais.email;
  }

  get possuiCnh(): boolean {
    return this.dadosAtuais.possuiCnh;
  }

  get cnhNumero(): string | null {
    return this.dadosAtuais.cnhNumero;
  }

  get cnhValidade(): Date | null {
    return clonarData(this.dadosAtuais.cnhValidade);
  }

  get situacaoCnh(): SituacaoCnh {
    return this.dadosAtuais.situacaoCnh;
  }

  get motivoSituacaoCnh(): string | null {
    return this.dadosAtuais.motivoSituacaoCnh;
  }

  get exerceAtividadeRemunerada(): boolean {
    return this.dadosAtuais.exerceAtividadeRemunerada;
  }

  get criadoEm(): Date {
    return new Date(this.dataCriacao.getTime());
  }

  get atualizadoEm(): Date {
    return new Date(this.dataAtualizacao.getTime());
  }

  obterDados(): CidadaoPersistido {
    return {
      ...this.dadosAtuais,
      id: this.identificador,
      cnhValidade: clonarData(this.dadosAtuais.cnhValidade),
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }
}
