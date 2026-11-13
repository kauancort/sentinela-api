import type { DadosVeiculo } from '../../../Domain/Veiculo/Veiculo';
import type { FiltrosVeiculo, PaginacaoVeiculo } from '../../../Domain/Veiculo/VeiculoRepository';
import { ErroDadosVeiculoInvalidos } from '../../Veiculo/VeiculoApplicationErrors';

const CAMPOS_CRIACAO = ['placa', 'marca', 'modelo', 'ano', 'cor', 'proprietarioId'] as const;
const CAMPOS_ATUALIZACAO = ['marca', 'modelo', 'ano', 'cor'] as const;
const CAMPOS_LISTAGEM = [
  'pagina',
  'tamanhoPagina',
  'placa',
  'marca',
  'modelo',
  'ano',
  'cor',
  'proprietarioId'
] as const;

const PAGINA_PADRAO = 1;
const TAMANHO_PAGINA_PADRAO = 20;
const TAMANHO_PAGINA_MAXIMO = 100;
const ANO_MINIMO = 1886;

function erro(campo: string, mensagem: string): never {
  throw new ErroDadosVeiculoInvalidos(campo, mensagem);
}

export function validarObjeto(
  input: unknown,
  campos: readonly string[],
  obrigatorios: readonly string[] = []
): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    erro('body', 'Envie um objeto.');
  }

  const dados = input as Record<string, unknown>;
  for (const campo of Object.keys(dados)) {
    if (!campos.includes(campo)) erro(campo, `O campo ${campo} não é aceito.`);
  }
  for (const campo of obrigatorios) {
    if (!Object.hasOwn(dados, campo)) erro(campo, `O campo ${campo} é obrigatório.`);
  }
  return dados;
}

export function validarId(id: unknown, campo = 'id'): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof id !== 'string' || !uuid.test(id)) {
    erro(campo, 'O ID deve ser um UUID válido.');
  }
  return id;
}

export function texto(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || !valor.trim()) {
    erro(campo, `${campo} deve ser um texto não vazio.`);
  }
  return valor.trim();
}

function textoComLimite(valor: unknown, campo: string, limite: number): string {
  const resultado = texto(valor, campo);
  if (resultado.length > limite) {
    erro(campo, `${campo} deve ter no máximo ${limite} caracteres.`);
  }
  return resultado;
}

export function normalizarPlaca(valor: unknown): string {
  const placa = texto(valor, 'placa').replace(/[\s-]/g, '').toUpperCase();
  const placaValida = /^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/.test(placa);
  if (!placaValida) {
    erro('placa', 'A placa deve seguir o formato brasileiro válido.');
  }
  return placa;
}

export function validarAno(valor: unknown, campo = 'ano'): number {
  if (typeof valor !== 'number' || !Number.isSafeInteger(valor)) {
    erro(campo, `${campo} deve ser um número inteiro.`);
  }

  const anoMaximo = new Date().getFullYear() + 1;
  if (valor < ANO_MINIMO || valor > anoMaximo) {
    erro(campo, `${campo} deve estar entre ${ANO_MINIMO} e ${anoMaximo}.`);
  }
  return valor;
}

function validarAnoFiltro(valor: unknown): number {
  if (typeof valor === 'number') return validarAno(valor);
  if (typeof valor === 'string' && /^\d+$/.test(valor)) return validarAno(Number(valor));
  erro('ano', 'ano deve ser um número inteiro.');
}

export function validarNumeroInteiroPositivo(
  valor: unknown,
  padrao: number,
  campo: string
): number {
  if (valor === undefined) return padrao;

  let numero: number;
  if (typeof valor === 'number') {
    numero = valor;
  } else if (typeof valor === 'string' && /^\d+$/.test(valor)) {
    numero = Number(valor);
  } else {
    erro(campo, `${campo} deve ser um inteiro positivo.`);
  }

  if (!Number.isSafeInteger(numero) || numero < 1) {
    erro(campo, `${campo} deve ser um inteiro positivo.`);
  }
  return numero;
}

function validarFiltrosTexto(
  valor: unknown,
  campo: 'marca' | 'modelo' | 'cor'
): string | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string') erro(campo, `${campo} deve ser texto.`);
  const resultado = valor.trim();
  return resultado || undefined;
}

export function validarDadosCriacao(input: unknown): DadosVeiculo {
  const dados = validarObjeto(input, CAMPOS_CRIACAO, CAMPOS_CRIACAO);
  return {
    placa: normalizarPlaca(dados.placa),
    marca: textoComLimite(dados.marca, 'marca', 100),
    modelo: textoComLimite(dados.modelo, 'modelo', 100),
    ano: validarAno(dados.ano),
    cor: textoComLimite(dados.cor, 'cor', 50),
    proprietarioId: validarId(dados.proprietarioId, 'proprietarioId')
  };
}

export function validarDadosAtualizacao(input: unknown): Pick<DadosVeiculo, 'marca' | 'modelo' | 'ano' | 'cor'> {
  const dados = validarObjeto(input, CAMPOS_ATUALIZACAO, CAMPOS_ATUALIZACAO);
  return {
    marca: textoComLimite(dados.marca, 'marca', 100),
    modelo: textoComLimite(dados.modelo, 'modelo', 100),
    ano: validarAno(dados.ano),
    cor: textoComLimite(dados.cor, 'cor', 50)
  };
}

export function validarTransferencia(input: unknown): string {
  const dados = validarObjeto(input, ['novoProprietarioId'], ['novoProprietarioId']);
  return validarId(dados.novoProprietarioId, 'novoProprietarioId');
}

export function validarListagem(input: unknown = {}): PaginacaoVeiculo {
  const consulta = validarObjeto(input, CAMPOS_LISTAGEM);
  const pagina = validarNumeroInteiroPositivo(consulta.pagina, PAGINA_PADRAO, 'pagina');
  const limite = validarNumeroInteiroPositivo(
    consulta.tamanhoPagina,
    TAMANHO_PAGINA_PADRAO,
    'tamanhoPagina'
  );
  if (limite > TAMANHO_PAGINA_MAXIMO) {
    erro('tamanhoPagina', `tamanhoPagina não pode ser maior que ${TAMANHO_PAGINA_MAXIMO}.`);
  }

  const filtros: FiltrosVeiculo = {};
  if (consulta.placa !== undefined) {
    if (typeof consulta.placa !== 'string') erro('placa', 'placa deve ser texto.');
    if (consulta.placa.trim()) filtros.placa = normalizarPlaca(consulta.placa);
  }
  for (const campo of ['marca', 'modelo', 'cor'] as const) {
    const valor = validarFiltrosTexto(consulta[campo], campo);
    if (valor) filtros[campo] = valor;
  }
  if (consulta.ano !== undefined) filtros.ano = validarAnoFiltro(consulta.ano);
  if (consulta.proprietarioId !== undefined) {
    if (typeof consulta.proprietarioId !== 'string') {
      erro('proprietarioId', 'proprietarioId deve ser texto.');
    }
    if (consulta.proprietarioId.trim()) {
      filtros.proprietarioId = validarId(consulta.proprietarioId, 'proprietarioId');
    }
  }

  if (!Number.isSafeInteger((pagina - 1) * limite)) {
    erro('pagina', 'A página excede o intervalo permitido.');
  }
  return { pagina, limite, filtros };
}
