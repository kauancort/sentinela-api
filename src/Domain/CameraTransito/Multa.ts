import { randomUUID } from 'node:crypto';

import {
  CatalogoMulta,
  GravidadeCatalogoMulta,
  ResponsabilidadeCatalogoMulta
} from '../CatalogoMulta/CatalogoMulta';
import type { Veiculo } from '../Veiculo/Veiculo';
import { ErroCatalogoMultaInativo, ErroDadosMultaInvalidos } from './CameraTransitoErrors';

export enum StatusMulta {
  REGISTRADA = 'REGISTRADA',
  AGUARDANDO_IDENTIFICACAO = 'AGUARDANDO_IDENTIFICACAO',
  CANCELADA = 'CANCELADA'
}

export const MOTIVO_CANCELAMENTO_MULTA = 'Cancelamento por erro de fiscalização.';
// 99.999.999,99 × 9.999,99, arredondado pelo catálogo para centavos.
export const VALOR_MAXIMO_MULTA = 999_998_999_900;

export interface DadosMulta {
  ocorrenciaId: string;
  codigoCamera: string;
  placaCapturada: string;
  veiculoId: string;
  proprietarioIdNaOcorrencia: string;
  condutorId: string | null;
  responsavelId: string | null;
  catalogoMultaId: string;
  codigoInfracaoAplicado: string;
  descricaoInfracaoAplicada: string;
  artigoCtbAplicado: string;
  gravidadeAplicada: GravidadeCatalogoMulta;
  responsabilidadeAplicada: ResponsabilidadeCatalogoMulta;
  valorAplicado: number;
  pontosAplicaveis: number;
  autossuspensiva: boolean;
  dataHoraOcorrencia: Date;
  local: string;
  status: StatusMulta;
  motivoCancelamento: string | null;
}

export interface CriarMulta {
  ocorrenciaId: string;
  codigoCamera: string;
  veiculo: Veiculo;
  catalogoMulta: CatalogoMulta;
  condutorId?: string | null;
  dataHoraOcorrencia: Date;
  local: string;
}

function invalidar(campo: string, mensagem: string): never {
  throw new ErroDadosMultaInvalidos(campo, mensagem);
}

function validarUuid(valor: string, campo: string): void {
  if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {
    invalidar(campo, `${campo} deve ser um UUID válido.`);
  }
}

function validarDados(dados: DadosMulta): void {
  for (const campo of ['ocorrenciaId', 'veiculoId', 'proprietarioIdNaOcorrencia', 'catalogoMultaId'] as const) {
    validarUuid(dados[campo], campo);
  }
  if (dados.condutorId !== null) validarUuid(dados.condutorId, 'condutorId');
  if (dados.responsavelId !== null) validarUuid(dados.responsavelId, 'responsavelId');
  const limites = { codigoCamera: 50, codigoInfracaoAplicado: 32, descricaoInfracaoAplicada: 500, artigoCtbAplicado: 100, local: 200 };
  for (const campo of Object.keys(limites) as (keyof typeof limites)[]) {
    const valor = dados[campo];
    if (typeof valor !== 'string' || !valor.trim() || valor.length > limites[campo]) {
      invalidar(campo, `${campo} é obrigatório e deve ter até ${limites[campo]} caracteres.`);
    }
  }
  if (!/^[A-Z]{3}(\d{4}|\d[A-Z]\d{2})$/.test(dados.placaCapturada)) invalidar('placaCapturada', 'Placa capturada inválida.');
  if (!(dados.dataHoraOcorrencia instanceof Date) || !Number.isFinite(dados.dataHoraOcorrencia.getTime())) {
    invalidar('dataHoraOcorrencia', 'A ocorrência deve ter uma data válida.');
  }
  if (!Object.values(GravidadeCatalogoMulta).includes(dados.gravidadeAplicada)) invalidar('gravidadeAplicada', 'Gravidade inválida.');
  if (!Object.values(ResponsabilidadeCatalogoMulta).includes(dados.responsabilidadeAplicada)) invalidar('responsabilidadeAplicada', 'Responsabilidade inválida.');
  if (typeof dados.autossuspensiva !== 'boolean') invalidar('autossuspensiva', 'autossuspensiva deve ser booleano.');
  if (!Number.isFinite(dados.valorAplicado) || dados.valorAplicado < 0 || dados.valorAplicado > VALOR_MAXIMO_MULTA || Math.round(dados.valorAplicado * 100) / 100 !== dados.valorAplicado) {
    invalidar('valorAplicado', 'Valor aplicado fora do intervalo ou da precisão monetária permitida.');
  }
  const pontosDaGravidade = { LEVE: 3, MEDIA: 4, GRAVE: 5, GRAVISSIMA: 7 }[dados.gravidadeAplicada];
  if (dados.pontosAplicaveis !== 0 && (dados.autossuspensiva || dados.pontosAplicaveis !== pontosDaGravidade)) {
    invalidar('pontosAplicaveis', 'Pontos incompatíveis com a gravidade ou com a suspensão específica.');
  }
  const responsavelEsperado = dados.responsabilidadeAplicada === ResponsabilidadeCatalogoMulta.PROPRIETARIO
    ? dados.proprietarioIdNaOcorrencia : dados.condutorId;
  if (dados.responsavelId !== responsavelEsperado) invalidar('responsavelId', 'Responsável incompatível com a responsabilidade aplicada.');
  const statusEsperado = dados.responsavelId === null ? StatusMulta.AGUARDANDO_IDENTIFICACAO : StatusMulta.REGISTRADA;
  if (dados.status === StatusMulta.CANCELADA) {
    if (dados.motivoCancelamento !== MOTIVO_CANCELAMENTO_MULTA) invalidar('motivoCancelamento', 'Motivo de cancelamento inválido.');
  } else if (dados.status !== statusEsperado || dados.motivoCancelamento !== null) {
    invalidar('status', 'Status ou motivo incompatível com a identificação do responsável.');
  }
}

export class Multa implements DadosMulta {
  readonly id: string;
  readonly ocorrenciaId!: string;
  readonly codigoCamera!: string;
  readonly placaCapturada!: string;
  readonly veiculoId!: string;
  readonly proprietarioIdNaOcorrencia!: string;
  readonly condutorId!: string | null;
  readonly responsavelId!: string | null;
  readonly catalogoMultaId!: string;
  readonly codigoInfracaoAplicado!: string;
  readonly descricaoInfracaoAplicada!: string;
  readonly artigoCtbAplicado!: string;
  readonly gravidadeAplicada!: GravidadeCatalogoMulta;
  readonly responsabilidadeAplicada!: ResponsabilidadeCatalogoMulta;
  readonly valorAplicado!: number;
  readonly pontosAplicaveis!: number;
  readonly autossuspensiva!: boolean;
  readonly local!: string;
  private readonly instanteOcorrencia: Date;
  private statusAtual: StatusMulta;
  private motivoAtual: string | null;

  private constructor(dados: DadosMulta, id: string) {
    validarUuid(id, 'id');
    validarDados(dados);
    const { status, motivoCancelamento, dataHoraOcorrencia, ...snapshots } = dados;
    Object.assign(this, snapshots);
    this.id = id;
    this.instanteOcorrencia = new Date(dataHoraOcorrencia.getTime());
    this.statusAtual = status;
    this.motivoAtual = motivoCancelamento;
  }

  static criar(entrada: CriarMulta): Multa {
    const { veiculo, catalogoMulta: catalogo } = entrada;
    if (!catalogo.ativo) throw new ErroCatalogoMultaInativo();
    if (typeof entrada.codigoCamera !== 'string') invalidar('codigoCamera', 'O código da câmera deve ser texto.');
    if (typeof entrada.local !== 'string') invalidar('local', 'O local deve ser texto.');
    if (entrada.dataHoraOcorrencia > new Date()) invalidar('dataHoraOcorrencia', 'A ocorrência não pode estar no futuro.');
    const condutorId = entrada.condutorId ?? null;
    const responsavelId = catalogo.responsabilidade === ResponsabilidadeCatalogoMulta.PROPRIETARIO
      ? veiculo.proprietarioId : condutorId;
    return new Multa({
      ocorrenciaId: entrada.ocorrenciaId,
      codigoCamera: entrada.codigoCamera.trim().toUpperCase(),
      placaCapturada: veiculo.placa.replace(/[\s-]/g, '').toUpperCase(),
      veiculoId: veiculo.id,
      proprietarioIdNaOcorrencia: veiculo.proprietarioId,
      condutorId,
      responsavelId,
      catalogoMultaId: catalogo.id,
      codigoInfracaoAplicado: catalogo.codigo,
      descricaoInfracaoAplicada: catalogo.descricao,
      artigoCtbAplicado: catalogo.artigoCtb,
      gravidadeAplicada: catalogo.gravidade,
      responsabilidadeAplicada: catalogo.responsabilidade,
      valorAplicado: catalogo.calcularValor(),
      pontosAplicaveis: catalogo.autossuspensiva ? 0 : catalogo.obterPontosAplicaveis(),
      autossuspensiva: catalogo.autossuspensiva,
      dataHoraOcorrencia: entrada.dataHoraOcorrencia,
      local: entrada.local.trim(),
      status: responsavelId === null ? StatusMulta.AGUARDANDO_IDENTIFICACAO : StatusMulta.REGISTRADA,
      motivoCancelamento: null
    }, randomUUID());
  }

  static reconstituir(dados: DadosMulta, id: string): Multa {
    return new Multa(dados, id);
  }

  get dataHoraOcorrencia(): Date { return new Date(this.instanteOcorrencia.getTime()); }
  get status(): StatusMulta { return this.statusAtual; }
  get motivoCancelamento(): string | null { return this.motivoAtual; }

  cancelar(): void {
    if (this.estaCancelada()) return;
    this.statusAtual = StatusMulta.CANCELADA;
    this.motivoAtual = MOTIVO_CANCELAMENTO_MULTA;
  }

  estaCancelada(): boolean { return this.statusAtual === StatusMulta.CANCELADA; }

  // A habilitação vem do contexto carregado pelo caso de uso, não da placa ou da propriedade.
  podeComputarPontos(responsavelHabilitado: boolean): boolean {
    return this.status === StatusMulta.REGISTRADA && this.responsavelId !== null
      && responsavelHabilitado === true && this.pontosAplicaveis > 0 && !this.autossuspensiva;
  }
}
