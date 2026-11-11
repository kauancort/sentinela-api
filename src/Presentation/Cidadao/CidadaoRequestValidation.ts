import { SituacaoCnh } from '../../Domain/Cidadao/Cidadao';
import { ErroDadosCidadaoInvalidos } from '../../Application/Cidadao/CidadaoApplicationErrors';
import type { AtualizarCidadaoRequestDto } from '../../Application/Cidadao/DTOs/Requests/AtualizarCidadaoRequestDto';
import type { CriarCidadaoRequestDto } from '../../Application/Cidadao/DTOs/Requests/CriarCidadaoRequestDto';
import type { ListarCidadaosRequestDto } from '../../Application/Cidadao/DTOs/Requests/ListarCidadaosRequestDto';

const CAMPOS_CIDADAO = [
  'nome',
  'cpf',
  'email',
  'possuiCnh',
  'cnhNumero',
  'cnhValidade',
  'situacaoCnh',
  'motivoSituacaoCnh',
  'exerceAtividadeRemunerada'
] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(campo: string, mensagem: string): never {
  throw new ErroDadosCidadaoInvalidos(campo, mensagem);
}

function objeto(value: unknown, campo: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return invalid(campo, 'Deve ser enviado um objeto JSON.');
  }
  return value as Record<string, unknown>;
}

function validarCampos(
  value: Record<string, unknown>,
  permitidos: readonly string[],
  obrigatorios: readonly string[]
): void {
  for (const campo of Object.keys(value)) {
    if (!permitidos.includes(campo)) {
      invalid(campo, `O campo ${campo} não é aceito.`);
    }
  }
  for (const campo of obrigatorios) {
    if (!Object.prototype.hasOwnProperty.call(value, campo)) {
      invalid(campo, `O campo ${campo} é obrigatório.`);
    }
  }
}

function validarTexto(value: unknown, campo: string, anulavel = false): void {
  if (anulavel && value === null) return;
  if (typeof value !== 'string') invalid(campo, `${campo} deve ser texto.`);
}

function validarBooleano(value: unknown, campo: string): void {
  if (typeof value !== 'boolean') invalid(campo, `${campo} deve ser booleano.`);
}

function validarValidadeCnh(value: unknown, obrigatorio: boolean): void {
  if (value === undefined && !obrigatorio) return;
  if (value === null) return;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    invalid('cnhValidade', 'cnhValidade deve ser uma data no formato AAAA-MM-DD ou nula.');
  }
}

function validarSituacaoCnh(value: unknown): void {
  if (
    typeof value !== 'string' ||
    !Object.values(SituacaoCnh).includes(value as SituacaoCnh)
  ) {
    invalid('situacaoCnh', 'A situação da CNH informada não é válida.');
  }
}

export function validarIdCidadao(id: unknown): string {
  if (typeof id !== 'string' || !UUID.test(id)) {
    invalid('id', 'O ID deve ser um UUID válido.');
  }
  return id;
}

export function validarCriarCidadaoBody(body: unknown): CriarCidadaoRequestDto {
  const value = objeto(body, 'body');
  validarCampos(value, CAMPOS_CIDADAO, ['nome', 'cpf', 'email', 'possuiCnh']);
  validarTexto(value.nome, 'nome');
  validarTexto(value.cpf, 'cpf');
  validarTexto(value.email, 'email');
  validarBooleano(value.possuiCnh, 'possuiCnh');

  if (value.cnhNumero !== undefined) validarTexto(value.cnhNumero, 'cnhNumero', true);
  validarValidadeCnh(value.cnhValidade, false);
  if (value.situacaoCnh !== undefined) validarSituacaoCnh(value.situacaoCnh);
  if (value.motivoSituacaoCnh !== undefined) {
    validarTexto(value.motivoSituacaoCnh, 'motivoSituacaoCnh', true);
  }
  if (value.exerceAtividadeRemunerada !== undefined) {
    validarBooleano(value.exerceAtividadeRemunerada, 'exerceAtividadeRemunerada');
  }

  return value as unknown as CriarCidadaoRequestDto;
}

export function validarAtualizarCidadaoBody(body: unknown): AtualizarCidadaoRequestDto {
  const value = objeto(body, 'body');
  validarCampos(value, CAMPOS_CIDADAO, CAMPOS_CIDADAO);
  validarTexto(value.nome, 'nome');
  validarTexto(value.cpf, 'cpf');
  validarTexto(value.email, 'email');
  validarBooleano(value.possuiCnh, 'possuiCnh');
  validarTexto(value.cnhNumero, 'cnhNumero', true);
  validarValidadeCnh(value.cnhValidade, true);
  validarSituacaoCnh(value.situacaoCnh);
  validarTexto(value.motivoSituacaoCnh, 'motivoSituacaoCnh', true);
  validarBooleano(value.exerceAtividadeRemunerada, 'exerceAtividadeRemunerada');

  return value as unknown as AtualizarCidadaoRequestDto;
}

export function validarListarCidadaosQuery(query: unknown): ListarCidadaosRequestDto {
  const value = objeto(query, 'query');
  const permitidos = ['pagina', 'tamanhoPagina', 'nome', 'cpf'] as const;
  validarCampos(value, permitidos, []);

  for (const campo of permitidos) {
    const valor = value[campo];
    if (valor !== undefined && typeof valor !== 'string') {
      invalid(campo, `${campo} deve ser um único valor de texto.`);
    }
  }
  return value as ListarCidadaosRequestDto;
}
