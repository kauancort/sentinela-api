import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AtualizarSimulacaoHandler } from '../../src/Application/SimulacaoAplicacaoMulta/AtualizarSimulacao/AtualizarSimulacaoHandler';
import { BuscarSimulacaoPorIdHandler } from '../../src/Application/SimulacaoAplicacaoMulta/BuscarSimulacaoPorId/BuscarSimulacaoPorIdHandler';
import { CriarSimulacaoHandler } from '../../src/Application/SimulacaoAplicacaoMulta/CriarSimulacao/CriarSimulacaoHandler';
import { ExcluirSimulacaoHandler } from '../../src/Application/SimulacaoAplicacaoMulta/ExcluirSimulacao/ExcluirSimulacaoHandler';
import { ListarSimulacoesHandler } from '../../src/Application/SimulacaoAplicacaoMulta/ListarSimulacoes/ListarSimulacoesHandler';
import {
  ISimulacaoAplicacaoMulta,
  StatusSimulacaoType
} from '../../src/Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMulta';
import {
  DadosSimulacaoInvalidosError,
  SimulacaoNaoEncontradaError
} from '../../src/Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaErrors';
import {
  IAtualizarSimulacaoData,
  ICriarSimulacaoData,
  SimulacaoAplicacaoMultaRepository
} from '../../src/Domain/SimulacaoAplicacaoMulta/SimulacaoAplicacaoMultaRepository';

class FakeSimulacaoRepository implements SimulacaoAplicacaoMultaRepository {
  private itens: ISimulacaoAplicacaoMulta[] = [];
  private proximoId = 1;

  async criar(dados: ICriarSimulacaoData): Promise<ISimulacaoAplicacaoMulta> {
    const item: ISimulacaoAplicacaoMulta = {
      id: this.proximoId++,
      placaVeiculo: dados.placaVeiculo,
      tipoMultaId: dados.tipoMultaId,
      dataHoraCaptura: dados.dataHoraCaptura ?? new Date(),
      localCaptura: dados.localCaptura,
      status: (dados.status as StatusSimulacaoType) ?? 'PENDENTE',
      motivoRejeicao: dados.motivoRejeicao ?? null,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    this.itens.push(item);
    return item;
  }

  async listar(): Promise<ISimulacaoAplicacaoMulta[]> {
    return [...this.itens];
  }

  async buscarPorId(id: number): Promise<ISimulacaoAplicacaoMulta | null> {
    const encontrado = this.itens.find((i) => i.id === id);
    return encontrado ? { ...encontrado } : null;
  }

  async atualizar(id: number, dados: IAtualizarSimulacaoData): Promise<ISimulacaoAplicacaoMulta> {
    const index = this.itens.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new SimulacaoNaoEncontradaError(id);
    }
    const item = this.itens[index];
    const atualizado: ISimulacaoAplicacaoMulta = {
      ...item,
      placaVeiculo: dados.placaVeiculo ?? item.placaVeiculo,
      tipoMultaId: dados.tipoMultaId ?? item.tipoMultaId,
      dataHoraCaptura: dados.dataHoraCaptura ?? item.dataHoraCaptura,
      localCaptura: dados.localCaptura ?? item.localCaptura,
      status: (dados.status as StatusSimulacaoType) ?? item.status,
      motivoRejeicao: dados.motivoRejeicao !== undefined ? dados.motivoRejeicao : item.motivoRejeicao,
      atualizadoEm: new Date()
    };
    this.itens[index] = atualizado;
    return atualizado;
  }

  async excluir(id: number): Promise<void> {
    this.itens = this.itens.filter((i) => i.id !== id);
  }
}

test('CRUD SimulacaoAplicacaoMulta - fluxo completo', async () => {
  const repo = new FakeSimulacaoRepository();
  const criarHandler = new CriarSimulacaoHandler(repo);
  const listarHandler = new ListarSimulacoesHandler(repo);
  const buscarPorIdHandler = new BuscarSimulacaoPorIdHandler(repo);
  const atualizarHandler = new AtualizarSimulacaoHandler(repo);
  const excluirHandler = new ExcluirSimulacaoHandler(repo);

  // 1. Criar
  const criada = await criarHandler.executar({
    placaVeiculo: 'BRA2E19',
    tipoMultaId: 1,
    localCaptura: 'Av. Ipiranga, 100'
  });

  assert.equal(criada.id, 1);
  assert.equal(criada.placaVeiculo, 'BRA2E19');
  assert.equal(criada.status, 'PENDENTE');

  // 2. Listar
  const lista = await listarHandler.executar();
  assert.equal(lista.length, 1);

  // 3. Buscar por ID
  const encontrada = await buscarPorIdHandler.executar(1);
  assert.equal(encontrada.id, 1);
  assert.equal(encontrada.localCaptura, 'Av. Ipiranga, 100');

  // 4. Atualizar
  const atualizada = await atualizarHandler.executar(1, {
    status: 'APROVADA',
    localCaptura: 'Av. Ipiranga, 120'
  });
  assert.equal(atualizada.status, 'APROVADA');
  assert.equal(atualizada.localCaptura, 'Av. Ipiranga, 120');

  // 5. Excluir
  await excluirHandler.executar(1);
  const listaAposExcluir = await listarHandler.executar();
  assert.equal(listaAposExcluir.length, 0);

  // 6. Buscar inexistente deve lançar SimulacaoNaoEncontradaError
  await assert.rejects(
    async () => buscarPorIdHandler.executar(1),
    SimulacaoNaoEncontradaError
  );

  // 7. Validação de placa inválida
  await assert.rejects(
    async () =>
      criarHandler.executar({
        placaVeiculo: '123',
        tipoMultaId: 1,
        localCaptura: 'Rua A'
      }),
    DadosSimulacaoInvalidosError
  );
});

