import { randomUUID } from 'node:crypto';

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

export type CriarCidadao = Pick<DadosCidadao, 'nome' | 'cpf' | 'email' | 'possuiCnh'> & Partial<DadosCidadao>;

export class Cidadao {
  readonly id: string;
  nome!: string;
  cpf!: string;
  email!: string;
  possuiCnh!: boolean;
  cnhNumero!: string | null;
  cnhValidade!: Date | null;
  situacaoCnh!: SituacaoCnh;
  motivoSituacaoCnh!: string | null;
  exerceAtividadeRemunerada!: boolean;
  constructor(
    dados: DadosCidadao,
    id: string = randomUUID()
  ) {
    Object.assign(this, dados);
    this.id = id;
  }

  static criar(dados: DadosCidadao): Cidadao {
    return new Cidadao(dados);
  }

  atualizar(dados: DadosCidadao): void {
    Object.assign(this, dados);
  }
}
