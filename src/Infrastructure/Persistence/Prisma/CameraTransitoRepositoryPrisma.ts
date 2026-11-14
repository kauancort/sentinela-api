import { Prisma, PrismaClient } from '@prisma/client';

import { GravidadeCatalogoMulta, ResponsabilidadeCatalogoMulta } from '../../../Domain/CatalogoMulta/CatalogoMulta';
import {
  ErroConflitoMulta,
  ErroDadosMultaInvalidos,
  ErroMultaNaoEncontrada,
  ErroOcorrenciaDuplicada,
  ErroVinculoCameraTransito
} from '../../../Domain/CameraTransito/CameraTransitoErrors';
import type {
  CameraTransitoRepository,
  ConsultaHistoricoComputavel,
  FiltrosMulta,
  PaginacaoMultas,
  ResultadoListarMultas
} from '../../../Domain/CameraTransito/CameraTransitoRepository';
import { MOTIVO_CANCELAMENTO_MULTA, Multa, StatusMulta } from '../../../Domain/CameraTransito/Multa';
import { prisma } from '../PrismaClient';

function mapearMulta(registro: Prisma.MultaGetPayload<Record<string, never>>): Multa {
  return Multa.reconstituir({
    ocorrenciaId: registro.ocorrenciaId,
    codigoCamera: registro.codigoCamera,
    placaCapturada: registro.placaCapturada,
    veiculoId: registro.veiculoId,
    proprietarioIdNaOcorrencia: registro.proprietarioIdNaOcorrencia,
    condutorId: registro.condutorId,
    responsavelId: registro.responsavelId,
    catalogoMultaId: registro.catalogoMultaId,
    codigoInfracaoAplicado: registro.codigoInfracaoAplicado,
    descricaoInfracaoAplicada: registro.descricaoInfracaoAplicada,
    artigoCtbAplicado: registro.artigoCtbAplicado,
    gravidadeAplicada: registro.gravidadeAplicada as GravidadeCatalogoMulta,
    responsabilidadeAplicada: registro.responsabilidadeAplicada as ResponsabilidadeCatalogoMulta,
    // O valor já está aplicado; não consultar nem recalcular o catálogo na leitura.
    valorAplicado: registro.valorAplicado.toNumber(),
    pontosAplicaveis: registro.pontosAplicaveis,
    autossuspensiva: registro.autossuspensiva,
    dataHoraOcorrencia: registro.dataHoraOcorrencia,
    local: registro.local,
    status: registro.status as StatusMulta,
    motivoCancelamento: registro.motivoCancelamento
  }, registro.id);
}

function validarIntervalo(inicio?: Date, fim?: Date): void {
  for (const [campo, data] of [['dataInicial', inicio], ['dataFinal', fim]] as const) {
    if (data !== undefined && (!(data instanceof Date) || !Number.isFinite(data.getTime()))) {
      throw new ErroDadosMultaInvalidos(campo, 'O intervalo deve conter datas válidas.');
    }
  }
  if (inicio && fim && inicio > fim) {
    throw new ErroDadosMultaInvalidos('dataInicial', 'A data inicial não pode ser posterior à final.');
  }
}

function montarFiltro(filtros: FiltrosMulta = {}): Prisma.MultaWhereInput {
  validarIntervalo(filtros.dataInicial, filtros.dataFinal);
  return {
    placaCapturada: filtros.placa?.replace(/[\s-]/g, '').toUpperCase(),
    codigoCamera: filtros.codigoCamera?.trim().toUpperCase(),
    catalogoMultaId: filtros.catalogoMultaId,
    condutorId: filtros.condutorId,
    responsavelId: filtros.responsavelId,
    status: filtros.status,
    gravidadeAplicada: filtros.gravidade,
    dataHoraOcorrencia: filtros.dataInicial || filtros.dataFinal
      ? { gte: filtros.dataInicial, lte: filtros.dataFinal } : undefined
  };
}

function propagarErroDeVinculo(erro: unknown): never {
  if (erro instanceof Prisma.PrismaClientKnownRequestError && ['P2003', 'P2014'].includes(erro.code)) {
    throw new ErroVinculoCameraTransito();
  }
  throw erro;
}

export class CameraTransitoRepositoryPrisma implements CameraTransitoRepository {
  constructor(private readonly cliente: PrismaClient = prisma) {}

  async salvar(multa: Multa): Promise<void> {
    try {
      await this.cliente.multa.create({
        data: {
          id: multa.id,
          ocorrenciaId: multa.ocorrenciaId,
          codigoCamera: multa.codigoCamera,
          placaCapturada: multa.placaCapturada,
          veiculoId: multa.veiculoId,
          proprietarioIdNaOcorrencia: multa.proprietarioIdNaOcorrencia,
          condutorId: multa.condutorId,
          responsavelId: multa.responsavelId,
          catalogoMultaId: multa.catalogoMultaId,
          codigoInfracaoAplicado: multa.codigoInfracaoAplicado,
          descricaoInfracaoAplicada: multa.descricaoInfracaoAplicada,
          artigoCtbAplicado: multa.artigoCtbAplicado,
          gravidadeAplicada: multa.gravidadeAplicada,
          responsabilidadeAplicada: multa.responsabilidadeAplicada,
          valorAplicado: new Prisma.Decimal(multa.valorAplicado.toFixed(2)),
          pontosAplicaveis: multa.pontosAplicaveis,
          autossuspensiva: multa.autossuspensiva,
          dataHoraOcorrencia: multa.dataHoraOcorrencia,
          local: multa.local,
          status: multa.status,
          motivoCancelamento: multa.motivoCancelamento
        }
      });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        const alvo = String(erro.meta?.target ?? '').toLowerCase();
        if (alvo.includes('ocorrencia')) throw new ErroOcorrenciaDuplicada(multa.ocorrenciaId);
        throw new ErroConflitoMulta('id', 'Já existe uma multa com esse identificador.');
      }
      propagarErroDeVinculo(erro);
    }
  }

  async buscarPorId(id: string): Promise<Multa | null> {
    const registro = await this.cliente.multa.findUnique({ where: { id } });
    return registro ? mapearMulta(registro) : null;
  }

  async buscarPorOcorrenciaId(ocorrenciaId: string): Promise<Multa | null> {
    const registro = await this.cliente.multa.findUnique({ where: { ocorrenciaId } });
    return registro ? mapearMulta(registro) : null;
  }

  async listar({ pagina, limite, filtros }: PaginacaoMultas): Promise<ResultadoListarMultas> {
    const skip = (pagina - 1) * limite;
    if (!Number.isSafeInteger(pagina) || pagina < 1 || !Number.isSafeInteger(limite) || limite < 1 || limite > 100 || !Number.isSafeInteger(skip)) {
      throw new ErroDadosMultaInvalidos('pagina', 'Paginação inválida; use inteiros positivos e até 100 itens por página.');
    }
    const where = montarFiltro(filtros);
    const [registros, total] = await this.cliente.$transaction([
      this.cliente.multa.findMany({ where, skip, take: limite, orderBy: [{ dataHoraOcorrencia: 'desc' }, { id: 'asc' }] }),
      this.cliente.multa.count({ where })
    ]);
    return { itens: registros.map(mapearMulta), total, pagina, limite };
  }

  async consultarHistoricoComputavel({ responsavelId, inicioExclusivo, fimInclusivo }: ConsultaHistoricoComputavel): Promise<Multa[]> {
    if (typeof responsavelId !== 'string' || !responsavelId || !(inicioExclusivo instanceof Date) || !(fimInclusivo instanceof Date)) {
      throw new ErroDadosMultaInvalidos('historico', 'Informe responsável e as duas datas do intervalo.');
    }
    validarIntervalo(inicioExclusivo, fimInclusivo);
    const registros = await this.cliente.multa.findMany({
      where: {
        responsavelId,
        status: StatusMulta.REGISTRADA,
        autossuspensiva: false,
        pontosAplicaveis: { gt: 0 },
        dataHoraOcorrencia: { gt: inicioExclusivo, lte: fimInclusivo }
      },
      orderBy: [{ dataHoraOcorrencia: 'asc' }, { id: 'asc' }]
    });
    return registros.map(mapearMulta);
  }

  async cancelar(id: string): Promise<void> {
    try {
      const resultado = await this.cliente.multa.updateMany({
        where: { id, status: { not: StatusMulta.CANCELADA } },
        data: { status: StatusMulta.CANCELADA, motivoCancelamento: MOTIVO_CANCELAMENTO_MULTA }
      });
      if (resultado.count === 0 && !await this.cliente.multa.findUnique({ where: { id }, select: { id: true } })) {
        throw new ErroMultaNaoEncontrada(id);
      }
    } catch (erro) {
      propagarErroDeVinculo(erro);
    }
  }
}
