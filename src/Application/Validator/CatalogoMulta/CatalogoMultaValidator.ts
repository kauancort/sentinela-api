import {
  GravidadeCatalogoMulta,
  ResponsabilidadeCatalogoMulta,
  type DadosCatalogoMulta
} from '../../../Domain/CatalogoMulta/CatalogoMulta';
import { ErroDadosCatalogoMultaInvalidos } from '../../CatalogoMulta/CatalogoMultaApplicationErrors';

export const CAMPOS_CATALOGO_MULTA = [
  'codigo', 'descricao', 'artigoCtb', 'gravidade', 'valorBase', 'multiplicador',
  'geraPontos', 'autossuspensiva', 'responsabilidade', 'ativo'
] as const;

function erro(campo: string, mensagem: string): never {
  throw new ErroDadosCatalogoMultaInvalidos(campo, mensagem);
}

export function validarObjetoCatalogoMulta(
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

export function validarIdCatalogoMulta(id: unknown): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof id !== 'string' || !uuid.test(id)) erro('id', 'O ID deve ser um UUID válido.');
  return id;
}

function texto(valor: unknown, campo: string, limite: number): string {
  if (typeof valor !== 'string' || !valor.trim()) erro(campo, `${campo} deve ser um texto não vazio.`);
  const normalizado = valor.trim();
  if (normalizado.length > limite) erro(campo, `${campo} deve ter no máximo ${limite} caracteres.`);
  return normalizado;
}

function decimal(valor: unknown, campo: string, maximo: number): number {
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
    erro(campo, `${campo} deve ser um número maior que zero.`);
  }
  if (valor > maximo) erro(campo, `${campo} excede o valor máximo permitido.`);
  if (Math.abs(Math.round(valor * 100) - valor * 100) > 1e-9) {
    erro(campo, `${campo} deve ter no máximo duas casas decimais.`);
  }
  return valor;
}

function booleano(valor: unknown, campo: string): boolean {
  if (typeof valor !== 'boolean') erro(campo, `${campo} deve ser booleano.`);
  return valor;
}

export function validarDadosCatalogoMulta(input: unknown, multiplicadorOpcional = false): DadosCatalogoMulta {
  const obrigatorios = multiplicadorOpcional
    ? CAMPOS_CATALOGO_MULTA.filter((campo) => campo !== 'multiplicador')
    : CAMPOS_CATALOGO_MULTA;
  const dados = validarObjetoCatalogoMulta(input, CAMPOS_CATALOGO_MULTA, obrigatorios);
  const codigo = texto(dados.codigo, 'codigo', 32).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.-]*$/.test(codigo)) {
    erro('codigo', 'codigo deve conter apenas letras, números, ponto ou hífen.');
  }
  const gravidade = dados.gravidade as GravidadeCatalogoMulta;
  if (!Object.values(GravidadeCatalogoMulta).includes(gravidade)) {
    erro('gravidade', 'gravidade deve ser LEVE, MEDIA, GRAVE ou GRAVISSIMA.');
  }
  const responsabilidade = dados.responsabilidade as ResponsabilidadeCatalogoMulta;
  if (!Object.values(ResponsabilidadeCatalogoMulta).includes(responsabilidade)) {
    erro('responsabilidade', 'responsabilidade deve ser CONDUTOR ou PROPRIETARIO.');
  }
  return {
    codigo,
    descricao: texto(dados.descricao, 'descricao', 500),
    artigoCtb: texto(dados.artigoCtb, 'artigoCtb', 100),
    gravidade,
    valorBase: decimal(dados.valorBase, 'valorBase', 99999999.99),
    multiplicador: dados.multiplicador === undefined
      ? 1
      : decimal(dados.multiplicador, 'multiplicador', 9999.99),
    geraPontos: booleano(dados.geraPontos, 'geraPontos'),
    autossuspensiva: booleano(dados.autossuspensiva, 'autossuspensiva'),
    responsabilidade,
    ativo: booleano(dados.ativo, 'ativo')
  };
}

export function validarInteiroConsulta(valor: unknown, campo: string, padrao: number, maximo?: number): number {
  if (valor === undefined) return padrao;
  if (typeof valor !== 'string' && typeof valor !== 'number') erro(campo, `${campo} deve ser um inteiro positivo.`);
  if (typeof valor === 'string' && !/^\d+$/.test(valor)) erro(campo, `${campo} deve ser um inteiro positivo.`);
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < 1 || (maximo !== undefined && numero > maximo)) {
    erro(campo, `${campo} deve ser um inteiro entre 1 e ${maximo ?? 'o limite permitido'}.`);
  }
  return numero;
}

export function validarBooleanoConsulta(valor: unknown, campo: string): boolean | undefined {
  if (valor === undefined) return undefined;
  if (valor === true || valor === 'true') return true;
  if (valor === false || valor === 'false') return false;
  erro(campo, `${campo} deve ser true ou false.`);
}
