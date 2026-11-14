import { normalizarPlaca } from '../Veiculo/VeiculoValidator';
import { ErroDadosVeiculoInvalidos } from '../../Veiculo/VeiculoApplicationErrors';
import { ErroDadosCameraTransitoInvalidos } from '../../CameraTransito/CameraTransitoApplicationErrors';

function invalidar(campo: string, mensagem: string): never {
  throw new ErroDadosCameraTransitoInvalidos(campo, mensagem);
}

function uuid(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {
    invalidar(campo, `${campo} deve ser um UUID válido.`);
  }
  return valor.toLowerCase();
}

function texto(valor: unknown, campo: string, limite: number): string {
  if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
    invalidar(campo, `${campo} deve ser texto não vazio com até ${limite} caracteres.`);
  }
  return valor.trim();
}

export function validarMultar(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalidar('body', 'Envie um objeto.');
  const dados = input as Record<string, unknown>;
  const obrigatorios = ['ocorrenciaId', 'codigoCamera', 'placa', 'catalogoMultaId', 'dataHoraOcorrencia', 'local'];
  for (const campo of Object.keys(dados)) {
    if (![...obrigatorios, 'condutorId'].includes(campo)) invalidar(campo, `O campo ${campo} não é aceito.`);
  }
  for (const campo of obrigatorios) {
    if (!Object.hasOwn(dados, campo)) invalidar(campo, `O campo ${campo} é obrigatório.`);
  }
  const iso = texto(dados.dataHoraOcorrencia, 'dataHoraOcorrencia', 35);
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(iso);
  if (!partes) invalidar('dataHoraOcorrencia', 'Informe uma data ISO 8601 real com fuso e precisão de até milissegundos.');
  const [, ano, mes, dia, hora, minuto, segundo, , horaFuso = '0', minutoFuso = '0'] = partes;
  const ultimoDia = new Date(Date.UTC(+ano, +mes, 0)).getUTCDate();
  const data = new Date(iso);
  if (+ano < 1000 || +mes < 1 || +mes > 12 || +dia < 1 || +dia > ultimoDia
    || +hora > 23 || +minuto > 59 || +segundo > 59 || +horaFuso > 23 || +minutoFuso > 59
    || !Number.isFinite(data.getTime()) || data.getUTCFullYear() < 1000 || data.getUTCFullYear() > 9999 || data > new Date()) {
    invalidar('dataHoraOcorrencia', 'A ocorrência deve ter data real, dentro do intervalo do banco e não futura.');
  }
  let placa: string;
  try {
    placa = normalizarPlaca(dados.placa);
  } catch (erro) {
    if (erro instanceof ErroDadosVeiculoInvalidos) invalidar('placa', erro.message);
    throw erro;
  }
  return {
    ocorrenciaId: uuid(dados.ocorrenciaId, 'ocorrenciaId'),
    codigoCamera: texto(dados.codigoCamera, 'codigoCamera', 50).toUpperCase(),
    placa,
    catalogoMultaId: uuid(dados.catalogoMultaId, 'catalogoMultaId'),
    condutorId: dados.condutorId == null ? null : uuid(dados.condutorId, 'condutorId'),
    dataHoraOcorrencia: data,
    local: texto(dados.local, 'local', 200)
  };
}
