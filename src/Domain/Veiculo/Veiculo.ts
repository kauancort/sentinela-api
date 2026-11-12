import { randomUUID } from 'node:crypto';

export interface DadosVeiculo {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  proprietarioId: string;
}

export class Veiculo {
  readonly id: string;
  placa!: string;
  marca!: string;
  modelo!: string;
  ano!: number;
  cor!: string;
  proprietarioId!: string;

  constructor(
    dados: DadosVeiculo,
    id: string = randomUUID()
  ) {
    Object.assign(this, dados);
    this.id = id;
  }

  static criar(dados: DadosVeiculo): Veiculo {
    return new Veiculo(dados);
  }

  atualizarDados(marca: string, modelo: string, ano: number, cor: string): void {
    this.marca = marca;
    this.modelo = modelo;
    this.ano = ano;
    this.cor = cor;
  }

  transferirPropriedade(novoProprietarioId: string): void {
    this.proprietarioId = novoProprietarioId;
  }

  pertenceAo(cidadaoId: string): boolean {
    return this.proprietarioId === cidadaoId;
  }
}
