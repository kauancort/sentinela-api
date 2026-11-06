export class SimulacaoNaoEncontradaError extends Error {
  constructor(id: number) {
    super(`Simulação de aplicação de multa com ID ${id} não foi encontrada.`);
    this.name = 'SimulacaoNaoEncontradaError';
  }
}

export class DadosSimulacaoInvalidosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DadosSimulacaoInvalidosError';
  }
}

