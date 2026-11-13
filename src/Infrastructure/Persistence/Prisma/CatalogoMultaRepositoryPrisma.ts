import {
  GravidadeCatalogoMulta as GravidadePrisma,
  Prisma,
  PrismaClient,
  ResponsabilidadeCatalogoMulta as ResponsabilidadePrisma
} from '@prisma/client';

import {
  CatalogoMulta,
  GravidadeCatalogoMulta,
  ResponsabilidadeCatalogoMulta
} from '../../../Domain/CatalogoMulta/CatalogoMulta';
import type {
  CatalogoMultaRepository,
  FiltrosCatalogoMulta,
  PaginacaoCatalogoMulta,
  ResultadoPaginadoCatalogoMulta
} from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import {
  ErroCatalogoMultaVinculado,
  ErroDuplicidadeCatalogoMulta
} from '../../../Domain/CatalogoMulta/CatalogoMultaErrors';
import { prisma } from '../PrismaClient';

function mapearCatalogoMulta(registro: Prisma.CatalogoMultaGetPayload<Record<string, never>>): CatalogoMulta {
  return new CatalogoMulta({
    codigo: registro.codigo,
    descricao: registro.descricao,
    artigoCtb: registro.artigoCtb,
    gravidade: registro.gravidade as GravidadeCatalogoMulta,
    valorBase: registro.valorBase.toNumber(),
    multiplicador: registro.multiplicador.toNumber(),
    geraPontos: registro.geraPontos,
    autossuspensiva: registro.autossuspensiva,
    responsabilidade: registro.responsabilidade as ResponsabilidadeCatalogoMulta,
    ativo: registro.ativo
  }, registro.id);
}

function montarFiltro(filtros?: FiltrosCatalogoMulta): Prisma.CatalogoMultaWhereInput {
  if (!filtros) return {};
  const where: Prisma.CatalogoMultaWhereInput = {};
  if (filtros.codigo) where.codigo = { contains: filtros.codigo };
  if (filtros.descricao) where.descricao = { contains: filtros.descricao };
  if (filtros.gravidade) where.gravidade = filtros.gravidade as GravidadePrisma;
  if (filtros.responsabilidade) {
    where.responsabilidade = filtros.responsabilidade as ResponsabilidadePrisma;
  }
  if (filtros.ativo !== undefined) where.ativo = filtros.ativo;
  return where;
}

function propagarErroGravacao(erro: unknown): never {
  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
    const alvo = String(erro.meta?.target ?? '').toLowerCase();
    throw new ErroDuplicidadeCatalogoMulta(alvo.includes('codigo') ? 'codigo' : 'desconhecido');
  }
  throw erro;
}

export class CatalogoMultaRepositoryPrisma implements CatalogoMultaRepository {
  constructor(private readonly cliente: PrismaClient = prisma) {}

  async salvar(catalogoMulta: CatalogoMulta): Promise<void> {
    const dados = {
      codigo: catalogoMulta.codigo,
      descricao: catalogoMulta.descricao,
      artigoCtb: catalogoMulta.artigoCtb,
      gravidade: catalogoMulta.gravidade as GravidadePrisma,
      valorBase: new Prisma.Decimal(catalogoMulta.valorBase),
      multiplicador: new Prisma.Decimal(catalogoMulta.multiplicador),
      geraPontos: catalogoMulta.geraPontos,
      autossuspensiva: catalogoMulta.autossuspensiva,
      responsabilidade: catalogoMulta.responsabilidade as ResponsabilidadePrisma,
      ativo: catalogoMulta.ativo
    };
    try {
      await this.cliente.catalogoMulta.upsert({
        where: { id: catalogoMulta.id },
        create: { id: catalogoMulta.id, ...dados },
        update: dados
      });
    } catch (erro) {
      propagarErroGravacao(erro);
    }
  }

  async buscarPorId(id: string): Promise<CatalogoMulta | null> {
    const registro = await this.cliente.catalogoMulta.findUnique({ where: { id } });
    return registro ? mapearCatalogoMulta(registro) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<CatalogoMulta | null> {
    const registro = await this.cliente.catalogoMulta.findUnique({ where: { codigo } });
    return registro ? mapearCatalogoMulta(registro) : null;
  }

  async listar(paginacao: PaginacaoCatalogoMulta): Promise<ResultadoPaginadoCatalogoMulta> {
    const skip = (paginacao.pagina - 1) * paginacao.limite;
    const where = montarFiltro(paginacao.filtros);
    const [registros, total] = await this.cliente.$transaction([
      this.cliente.catalogoMulta.findMany({
        where,
        skip,
        take: paginacao.limite,
        orderBy: [{ codigo: 'asc' }, { id: 'asc' }]
      }),
      this.cliente.catalogoMulta.count({ where })
    ]);
    return {
      itens: registros.map(mapearCatalogoMulta),
      pagina: paginacao.pagina,
      limite: paginacao.limite,
      total
    };
  }

  async excluir(id: string): Promise<void> {
    try {
      await this.cliente.catalogoMulta.delete({ where: { id } });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && ['P2003', 'P2014'].includes(erro.code)) {
        throw new ErroCatalogoMultaVinculado();
      }
      throw erro;
    }
  }
}
