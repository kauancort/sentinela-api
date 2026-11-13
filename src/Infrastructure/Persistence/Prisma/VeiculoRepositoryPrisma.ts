import { Prisma, PrismaClient } from '@prisma/client';

import { Veiculo } from '../../../Domain/Veiculo/Veiculo';
import {
  ErroProprietarioVeiculoNaoEncontrado,
  ErroVeiculoNaoEncontrado,
  ErroVeiculoVinculado,
  ErroDuplicidadeVeiculo,
  type CampoUnicoVeiculo
} from '../../../Domain/Veiculo/VeiculoErrors';
import {
  type FiltrosVeiculo,
  type PaginacaoVeiculo,
  type ResultadoPaginadoVeiculo,
  type VeiculoRepository
} from '../../../Domain/Veiculo/VeiculoRepository';
import { prisma } from '../PrismaClient';

type RegistroVeiculo = Prisma.VeiculoGetPayload<Record<string, never>>;

function mapearVeiculo(registro: RegistroVeiculo): Veiculo {
  return new Veiculo({
    placa: registro.placa,
    marca: registro.marca,
    modelo: registro.modelo,
    ano: registro.ano,
    cor: registro.cor,
    proprietarioId: registro.proprietarioId
  }, registro.id);
}

function normalizarPlaca(placa: string): string {
  return placa.replace(/[\s-]/g, '').toUpperCase();
}

function montarFiltro(filtros: FiltrosVeiculo | undefined): Prisma.VeiculoWhereInput {
  if (!filtros) return {};

  const where: Prisma.VeiculoWhereInput = {};
  if (filtros.placa !== undefined) where.placa = normalizarPlaca(filtros.placa);
  if (filtros.marca?.trim()) where.marca = { contains: filtros.marca.trim() };
  if (filtros.modelo?.trim()) where.modelo = { contains: filtros.modelo.trim() };
  if (filtros.ano !== undefined) where.ano = filtros.ano;
  if (filtros.cor?.trim()) where.cor = { contains: filtros.cor.trim() };
  if (filtros.proprietarioId !== undefined) where.proprietarioId = filtros.proprietarioId;
  return where;
}

function converterErroDeUnicidade(erro: unknown): ErroDuplicidadeVeiculo | null {
  if (
    !(erro instanceof Prisma.PrismaClientKnownRequestError) ||
    erro.code !== 'P2002'
  ) {
    return null;
  }

  const alvo = erro.meta?.target;
  const identificador = (Array.isArray(alvo) ? alvo.join(' ') : String(alvo ?? '')).toLowerCase();
  const campo: CampoUnicoVeiculo = identificador.includes('placa') ? 'placa' : 'desconhecido';
  return new ErroDuplicidadeVeiculo(campo);
}

function dadosDoVeiculo(veiculo: Veiculo) {
  return {
    placa: normalizarPlaca(veiculo.placa),
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano,
    cor: veiculo.cor,
    proprietarioId: veiculo.proprietarioId
  };
}

export class VeiculoRepositoryPrisma implements VeiculoRepository {
  constructor(private readonly cliente: PrismaClient = prisma) {}

  async salvar(veiculo: Veiculo): Promise<void> {
    const dados = dadosDoVeiculo(veiculo);

    try {
      await this.cliente.veiculo.upsert({
        where: { id: veiculo.id },
        create: {
          id: veiculo.id,
          ...dados
        },
        update: dados
      });
    } catch (erro) {
      const erroDeUnicidade = converterErroDeUnicidade(erro);
      if (erroDeUnicidade) throw erroDeUnicidade;
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        (erro.code === 'P2003' || erro.code === 'P2014')
      ) {
        throw new ErroProprietarioVeiculoNaoEncontrado(veiculo.proprietarioId);
      }
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2025'
      ) {
        throw new ErroVeiculoNaoEncontrado(veiculo.id);
      }
      throw erro;
    }
  }

  async buscarPorId(id: string): Promise<Veiculo | null> {
    const registro = await this.cliente.veiculo.findUnique({ where: { id } });
    return registro === null ? null : mapearVeiculo(registro);
  }

  async buscarPorPlaca(placa: string): Promise<Veiculo | null> {
    const registro = await this.cliente.veiculo.findUnique({
      where: { placa: normalizarPlaca(placa) }
    });
    return registro === null ? null : mapearVeiculo(registro);
  }

  async proprietarioExiste(proprietarioId: string): Promise<boolean> {
    const registro = await this.cliente.cidadao.findUnique({
      where: { id: proprietarioId },
      select: { id: true }
    });
    return registro !== null;
  }

  async listar(paginacao: PaginacaoVeiculo): Promise<ResultadoPaginadoVeiculo> {
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
      this.cliente.veiculo.findMany({
        where,
        skip,
        take: limite,
        orderBy: [{ placa: 'asc' }, { id: 'asc' }]
      }),
      this.cliente.veiculo.count({ where })
    ]);

    return {
      itens: registros.map(mapearVeiculo),
      pagina,
      limite,
      total
    };
  }

  async excluir(id: string): Promise<void> {
    try {
      await this.cliente.veiculo.delete({ where: { id } });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError) {
        if (erro.code === 'P2025') throw new ErroVeiculoNaoEncontrado(id);
        if (erro.code === 'P2003' || erro.code === 'P2014') {
          throw new ErroVeiculoVinculado();
        }
      }
      throw erro;
    }
  }
}
