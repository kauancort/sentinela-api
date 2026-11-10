import {
  Prisma,
  PrismaClient,
  SituacaoCnh as SituacaoCnhPrisma
} from '@prisma/client';

import { Cidadao, SituacaoCnh } from '../../../Domain/Cidadao/Cidadao';
import {
  CidadaoRepository,
  FiltrosCidadao,
  PaginacaoCidadao,
  ResultadoPaginado
} from '../../../Domain/Cidadao/CidadaoRepository';
import {
  CampoUnicoCidadao,
  ErroCidadaoVinculado,
  ErroDuplicidadeCidadao
} from '../../../Domain/Cidadao/CidadaoErrors';
import { prisma } from '../PrismaClient';

function paraSituacaoPrisma(situacao: SituacaoCnh): SituacaoCnhPrisma {
  switch (situacao) {
    case SituacaoCnh.SEM_HABILITACAO:
      return SituacaoCnhPrisma.SEM_HABILITACAO;
    case SituacaoCnh.REGULAR:
      return SituacaoCnhPrisma.REGULAR;
    case SituacaoCnh.SUSPENSA:
      return SituacaoCnhPrisma.SUSPENSA;
    case SituacaoCnh.CASSADA:
      return SituacaoCnhPrisma.CASSADA;
  }
}

function paraSituacaoDominio(situacao: SituacaoCnhPrisma): SituacaoCnh {
  switch (situacao) {
    case SituacaoCnhPrisma.SEM_HABILITACAO:
      return SituacaoCnh.SEM_HABILITACAO;
    case SituacaoCnhPrisma.REGULAR:
      return SituacaoCnh.REGULAR;
    case SituacaoCnhPrisma.SUSPENSA:
      return SituacaoCnh.SUSPENSA;
    case SituacaoCnhPrisma.CASSADA:
      return SituacaoCnh.CASSADA;
  }
}

function dataSemHorario(data: Date | null): Date | null {
  if (data === null) return null;
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}

function mapearCidadao(registro: Prisma.CidadaoGetPayload<Record<string, never>>): Cidadao {
  return Cidadao.reconstituir({
    id: registro.id,
    nome: registro.nome,
    cpf: registro.cpf,
    email: registro.email,
    possuiCnh: registro.possuiCnh,
    cnhNumero: registro.cnhNumero,
    cnhValidade: registro.cnhValidade,
    situacaoCnh: paraSituacaoDominio(registro.situacaoCnh),
    motivoSituacaoCnh: registro.motivoSituacaoCnh,
    exerceAtividadeRemunerada: registro.exerceAtividadeRemunerada,
    criadoEm: registro.criadoEm,
    atualizadoEm: registro.atualizadoEm
  });
}

function montarFiltro(filtros: FiltrosCidadao | undefined): Prisma.CidadaoWhereInput {
  if (!filtros) return {};

  const where: Prisma.CidadaoWhereInput = {};
  if (filtros.nome?.trim()) where.nome = { contains: filtros.nome.trim() };
  if (filtros.cpf !== undefined) where.cpf = filtros.cpf.trim().replace(/[.-]/g, '');
  if (filtros.email !== undefined) where.email = filtros.email;
  if (filtros.possuiCnh !== undefined) where.possuiCnh = filtros.possuiCnh;
  if (filtros.cnhNumero !== undefined) where.cnhNumero = filtros.cnhNumero;
  if (filtros.situacaoCnh !== undefined) {
    where.situacaoCnh = paraSituacaoPrisma(filtros.situacaoCnh);
  }
  return where;
}

function converterErroDeUnicidade(erro: unknown): ErroDuplicidadeCidadao | null {
  if (
    !(erro instanceof Prisma.PrismaClientKnownRequestError) ||
    erro.code !== 'P2002'
  ) {
    return null;
  }

  const alvo = erro.meta?.target;
  const identificador = (Array.isArray(alvo) ? alvo.join(' ') : String(alvo ?? '')).toLowerCase();
  let campo: CampoUnicoCidadao = 'desconhecido';
  if (identificador.includes('cpf')) campo = 'cpf';
  else if (identificador.includes('cnhnumero') || identificador.includes('cnh_numero')) {
    campo = 'cnhNumero';
  }

  return new ErroDuplicidadeCidadao(campo);
}

function propagarErroDeGravacao(erro: unknown): never {
  const erroDeUnicidade = converterErroDeUnicidade(erro);
  if (erroDeUnicidade) throw erroDeUnicidade;
  throw erro;
}

export class CidadaoRepositoryPrisma implements CidadaoRepository {
  constructor(private readonly cliente: PrismaClient = prisma) {}

  async salvar(cidadao: Cidadao): Promise<void> {
    const dados = cidadao.obterDados();
    const dadosComuns = {
      nome: dados.nome,
      cpf: dados.cpf,
      email: dados.email,
      possuiCnh: dados.possuiCnh,
      cnhNumero: dados.cnhNumero,
      cnhValidade: dataSemHorario(dados.cnhValidade),
      situacaoCnh: paraSituacaoPrisma(dados.situacaoCnh),
      motivoSituacaoCnh: dados.motivoSituacaoCnh,
      exerceAtividadeRemunerada: dados.exerceAtividadeRemunerada,
      atualizadoEm: dados.atualizadoEm
    };

    try {
      await this.cliente.cidadao.upsert({
        where: { id: dados.id },
        create: {
          id: dados.id,
          ...dadosComuns,
          criadoEm: dados.criadoEm
        },
        update: dadosComuns
      });
    } catch (erro) {
      propagarErroDeGravacao(erro);
    }
  }

  async buscarPorId(id: string): Promise<Cidadao | null> {
    const registro = await this.cliente.cidadao.findUnique({ where: { id } });
    return registro === null ? null : mapearCidadao(registro);
  }

  async buscarPorCpf(cpf: string): Promise<Cidadao | null> {
    const cpfNormalizado = cpf.replace(/[.-]/g, '');
    const registro = await this.cliente.cidadao.findUnique({
      where: { cpf: cpfNormalizado }
    });
    return registro === null ? null : mapearCidadao(registro);
  }

  async buscarPorCnh(cnhNumero: string): Promise<Cidadao | null> {
    const registro = await this.cliente.cidadao.findUnique({
      where: { cnhNumero }
    });
    return registro === null ? null : mapearCidadao(registro);
  }

  async listar(paginacao: PaginacaoCidadao): Promise<ResultadoPaginado<Cidadao>> {
    const { pagina, limite, filtros } = paginacao;
    if (!Number.isSafeInteger(pagina) || pagina < 1) {
      throw new RangeError('A página deve ser um inteiro positivo.');
    }
    if (!Number.isSafeInteger(limite) || limite < 1) {
      throw new RangeError('O limite deve ser um inteiro positivo.');
    }

    const skip = (pagina - 1) * limite;
    if (!Number.isSafeInteger(skip)) {
      throw new RangeError('A paginação excede o intervalo permitido.');
    }

    const where = montarFiltro(filtros);
    const [registros, total] = await this.cliente.$transaction([
      this.cliente.cidadao.findMany({
        where,
        skip,
        take: limite,
        orderBy: [{ nome: 'asc' }, { id: 'asc' }]
      }),
      this.cliente.cidadao.count({ where })
    ]);

    return {
      itens: registros.map(mapearCidadao),
      pagina,
      limite,
      total
    };
  }

  async excluir(id: string): Promise<void> {
    try {
      await this.cliente.cidadao.deleteMany({ where: { id } });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        (erro.code === 'P2003' || erro.code === 'P2014')
      ) {
        throw new ErroCidadaoVinculado();
      }
      throw erro;
    }
  }
}
