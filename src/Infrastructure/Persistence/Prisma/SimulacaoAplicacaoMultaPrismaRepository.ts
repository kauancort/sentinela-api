import {
  ISimulacaoAplicacaoMulta,
  StatusSimulacaoType
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMulta';
import {
  IAtualizarSimulacaoData,
  ICriarSimulacaoData,
  SimulacaoAplicacaoMultaRepository
} from '../../../Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';
import { prisma } from '../PrismaClient';

export class SimulacaoAplicacaoMultaPrismaRepository implements SimulacaoAplicacaoMultaRepository {
  public async criar(dados: ICriarSimulacaoData): Promise<ISimulacaoAplicacaoMulta> {
    const registro = await prisma.simulacaoAplicacaoMulta.create({
      data: {
        placaVeiculo: dados.placaVeiculo,
        tipoMultaId: dados.tipoMultaId,
        localCaptura: dados.localCaptura,
        ...(dados.dataHoraCaptura ? { dataHoraCaptura: dados.dataHoraCaptura } : {}),
        ...(dados.status ? { status: dados.status as StatusSimulacaoType } : {}),
        motivoRejeicao: dados.motivoRejeicao ?? null
      }
    });

    return registro as ISimulacaoAplicacaoMulta;
  }

  public async listar(): Promise<ISimulacaoAplicacaoMulta[]> {
    const registros = await prisma.simulacaoAplicacaoMulta.findMany({
      orderBy: { id: 'desc' }
    });

    return registros as ISimulacaoAplicacaoMulta[];
  }

  public async buscarPorId(id: number): Promise<ISimulacaoAplicacaoMulta | null> {
    const registro = await prisma.simulacaoAplicacaoMulta.findUnique({
      where: { id }
    });

    return (registro as ISimulacaoAplicacaoMulta) || null;
  }

  public async atualizar(id: number, dados: IAtualizarSimulacaoData): Promise<ISimulacaoAplicacaoMulta> {
    const registro = await prisma.simulacaoAplicacaoMulta.update({
      where: { id },
      data: {
        ...(dados.placaVeiculo !== undefined ? { placaVeiculo: dados.placaVeiculo } : {}),
        ...(dados.tipoMultaId !== undefined ? { tipoMultaId: dados.tipoMultaId } : {}),
        ...(dados.dataHoraCaptura !== undefined ? { dataHoraCaptura: dados.dataHoraCaptura } : {}),
        ...(dados.localCaptura !== undefined ? { localCaptura: dados.localCaptura } : {}),
        ...(dados.status !== undefined ? { status: dados.status as StatusSimulacaoType } : {}),
        ...(dados.motivoRejeicao !== undefined ? { motivoRejeicao: dados.motivoRejeicao } : {})
      }
    });

    return registro as ISimulacaoAplicacaoMulta;
  }

  public async excluir(id: number): Promise<void> {
    await prisma.simulacaoAplicacaoMulta.delete({
      where: { id }
    });
  }
}

