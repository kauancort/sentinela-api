import { randomUUID } from 'node:crypto';

export enum GravidadeCatalogoMulta {
  LEVE = 'LEVE',
  MEDIA = 'MEDIA',
  GRAVE = 'GRAVE',
  GRAVISSIMA = 'GRAVISSIMA'
}

export enum ResponsabilidadeCatalogoMulta {
  CONDUTOR = 'CONDUTOR',
  PROPRIETARIO = 'PROPRIETARIO'
}

export interface DadosCatalogoMulta {
  codigo: string;
  descricao: string;
  artigoCtb: string;
  gravidade: GravidadeCatalogoMulta;
  valorBase: number;
  multiplicador: number;
  geraPontos: boolean;
  autossuspensiva: boolean;
  responsabilidade: ResponsabilidadeCatalogoMulta;
  ativo: boolean;
}

export class CatalogoMulta {
  readonly id: string;
  codigo!: string;
  descricao!: string;
  artigoCtb!: string;
  gravidade!: GravidadeCatalogoMulta;
  valorBase!: number;
  multiplicador!: number;
  geraPontos!: boolean;
  autossuspensiva!: boolean;
  responsabilidade!: ResponsabilidadeCatalogoMulta;
  ativo!: boolean;

  constructor(dados: DadosCatalogoMulta, id: string = randomUUID()) {
    Object.assign(this, dados);
    this.id = id;
  }

  static criar(dados: DadosCatalogoMulta): CatalogoMulta {
    return new CatalogoMulta(dados);
  }

  atualizar(dados: DadosCatalogoMulta): void {
    Object.assign(this, dados);
  }

  calcularValor(): number {
    return Number((this.valorBase * this.multiplicador).toFixed(2));
  }

  obterPontosAplicaveis(): number {
    if (!this.geraPontos) return 0;
    return {
      [GravidadeCatalogoMulta.LEVE]: 3,
      [GravidadeCatalogoMulta.MEDIA]: 4,
      [GravidadeCatalogoMulta.GRAVE]: 5,
      [GravidadeCatalogoMulta.GRAVISSIMA]: 7
    }[this.gravidade];
  }

  ativar(): void {
    this.ativo = true;
  }

  desativar(): void {
    this.ativo = false;
  }
}
