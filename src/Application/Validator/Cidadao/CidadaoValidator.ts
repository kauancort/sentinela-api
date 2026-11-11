import { SituacaoCnh, type DadosCidadao } from '../../../Domain/Cidadao/Cidadao';
import { ErroDadosCidadaoInvalidos } from '../../Cidadao/CidadaoApplicationErrors';

const CAMPOS = ['nome', 'cpf', 'email', 'possuiCnh', 'cnhNumero', 'cnhValidade', 'situacaoCnh', 'motivoSituacaoCnh', 'exerceAtividadeRemunerada'];

function erro(campo: string, mensagem: string): never {
  throw new ErroDadosCidadaoInvalidos(campo, mensagem);
}

function texto(valor: unknown, campo: string, obrigatorio = true): string {
  if (valor == null && !obrigatorio) return '';
  if (typeof valor !== 'string' || (obrigatorio && !valor.trim())) {
    erro(campo, `${campo} deve ser um texto${obrigatorio ? ' não vazio' : ''}.`);
  }
  return valor.trim();
}

export function validarObjeto(input: unknown, campos: readonly string[], obrigatorios: readonly string[] = []): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) erro('body', 'Envie um objeto.');
  const dados = input as Record<string, unknown>;
  for (const campo of Object.keys(dados)) {
    if (!campos.includes(campo)) erro(campo, `O campo ${campo} não é aceito.`);
  }
  for (const campo of obrigatorios) {
    if (!Object.hasOwn(dados, campo)) erro(campo, `O campo ${campo} é obrigatório.`);
  }
  return dados;
}

export function validarId(id: unknown): string {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof id !== 'string' || !uuid.test(id)) erro('id', 'O ID deve ser um UUID válido.');
  return id;
}

export function normalizarCpf(valor: unknown): string {
  const informado = texto(valor, 'cpf');
  if (!/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(informado)) {
    erro('cpf', 'O CPF deve conter 11 dígitos, com ou sem máscara.');
  }
  const cpf = informado.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(cpf)) erro('cpf', 'O CPF não pode ter todos os dígitos iguais.');
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = soma % 11;
    if (Number(cpf[tamanho]) !== (resto < 2 ? 0 : 11 - resto)) erro('cpf', 'O CPF informado é inválido.');
  }
  return cpf;
}

function validarData(valor: unknown): Date | null {
  if (valor == null) return null;
  if (valor instanceof Date && Number.isFinite(valor.getTime())) valor = valor.toISOString().slice(0, 10);
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    erro('cnhValidade', 'Informe uma data válida no formato AAAA-MM-DD.');
  }
  const data = new Date(`${valor}T00:00:00.000Z`);
  if (!Number.isFinite(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    erro('cnhValidade', 'A validade da CNH deve ser uma data válida.');
  }
  return data;
}

export function validarDados(input: unknown, completo = false): DadosCidadao {
  const dados = validarObjeto(input, CAMPOS, completo ? CAMPOS : ['nome', 'cpf', 'email', 'possuiCnh']);
  const nome = texto(dados.nome, 'nome');
  const cpf = normalizarCpf(dados.cpf);
  const email = texto(dados.email, 'email');
  if (nome.length > 200) erro('nome', 'O nome deve ter no máximo 200 caracteres.');
  if (email.length > 254) erro('email', 'O e-mail deve ter no máximo 254 caracteres.');
  if (!/^[^\s@.]+(?:\.[^\s@.]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(email)) {
    erro('email', 'O e-mail informado é inválido.');
  }
  if (typeof dados.possuiCnh !== 'boolean') erro('possuiCnh', 'possuiCnh deve ser booleano.');
  if (dados.exerceAtividadeRemunerada !== undefined && typeof dados.exerceAtividadeRemunerada !== 'boolean') {
    erro('exerceAtividadeRemunerada', 'exerceAtividadeRemunerada deve ser booleano.');
  }

  const cnhNumero = texto(dados.cnhNumero, 'cnhNumero', false);
  if (cnhNumero.length > 32) erro('cnhNumero', 'A CNH deve ter no máximo 32 caracteres.');
  const cnhValidade = validarData(dados.cnhValidade);
  const motivo = texto(dados.motivoSituacaoCnh, 'motivoSituacaoCnh', false);
  const situacao = dados.situacaoCnh as SituacaoCnh | undefined;
  if (situacao !== undefined && !Object.values(SituacaoCnh).includes(situacao)) {
    erro('situacaoCnh', 'A situação da CNH informada não é válida.');
  }
  if (!dados.possuiCnh) {
    return { nome, cpf, email, possuiCnh: false, cnhNumero: null, cnhValidade: null,
      situacaoCnh: SituacaoCnh.SEM_HABILITACAO, motivoSituacaoCnh: null, exerceAtividadeRemunerada: false };
  }
  if (!cnhNumero) erro('cnhNumero', 'O número da CNH é obrigatório.');
  if (!cnhValidade) erro('cnhValidade', 'A validade da CNH é obrigatória.');
  if (!situacao || situacao === SituacaoCnh.SEM_HABILITACAO) erro('situacaoCnh', 'Informe a situação da CNH.');
  const exigeMotivo = situacao === SituacaoCnh.SUSPENSA || situacao === SituacaoCnh.CASSADA;
  if (exigeMotivo && !motivo) erro('motivoSituacaoCnh', 'Informe o motivo da suspensão ou cassação da CNH.');
  return { nome, cpf, email, possuiCnh: true, cnhNumero, cnhValidade, situacaoCnh: situacao,
    motivoSituacaoCnh: exigeMotivo ? motivo : null, exerceAtividadeRemunerada: dados.exerceAtividadeRemunerada === true };
}
