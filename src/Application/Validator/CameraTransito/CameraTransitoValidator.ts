import { normalizarPlaca } from '../Veiculo/VeiculoValidator';
import { ErroDadosVeiculoInvalidos } from '../../Veiculo/VeiculoApplicationErrors';
import { ErroDadosCameraTransitoInvalidos } from '../../CameraTransito/CameraTransitoApplicationErrors';

export function invalidar(campo: string, mensagem: string): never {
  throw new ErroDadosCameraTransitoInvalidos(campo, mensagem);
}

export function validarObjeto(input: unknown, campos: readonly string[], obrigatorios: readonly string[] = []): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalidar('body', 'Envie um objeto.');
  const dados = input as Record<string, unknown>;
  for (const campo of Object.keys(dados)) {
    if (!campos.includes(campo)) invalidar(campo, `O campo ${campo} não é aceito.`);
  }
  for (const campo of obrigatorios) {
    if (!Object.hasOwn(dados, campo)) invalidar(campo, `O campo ${campo} é obrigatório.`);
  }
  return dados;
}

export function validarUuid(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {
    invalidar(campo, `${campo} deve ser um UUID válido.`);
  }
  return valor.toLowerCase();
}

export function validarTexto(valor: unknown, campo: string, limite: number): string {
  if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
    invalidar(campo, `${campo} deve ser texto não vazio com até ${limite} caracteres.`);
  }
  return valor.trim();
}

export function validarPlaca(valor: unknown): string {
  try {
    return normalizarPlaca(valor);
  } catch (erro) {
    if (erro instanceof ErroDadosVeiculoInvalidos) invalidar('placa', erro.message);
    throw erro;
  }
}

export function validarDataComFuso(valor: unknown, campo: string): Date {
  const iso = validarTexto(valor, campo, 35);
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(iso);
  if (!partes) invalidar(campo, 'Informe uma data ISO 8601 real com fuso e precisão de até milissegundos.');
  const [, ano, mes, dia, hora, minuto, segundo, , horaFuso = '0', minutoFuso = '0'] = partes;
  const ultimoDia = new Date(Date.UTC(+ano, +mes, 0)).getUTCDate();
  const data = new Date(iso);
  if (+ano < 1000 || +mes < 1 || +mes > 12 || +dia < 1 || +dia > ultimoDia
    || +hora > 23 || +minuto > 59 || +segundo > 59 || +horaFuso > 23 || +minutoFuso > 59
    || !Number.isFinite(data.getTime()) || data.getUTCFullYear() < 1000 || data.getUTCFullYear() > 9999) {
    invalidar(campo, 'A data deve ser real e estar dentro do intervalo do banco.');
  }
  return data;
}
