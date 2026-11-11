import type { FiltrosCidadao, PaginacaoCidadao } from '../../../Domain/Cidadao/CidadaoRepository';
import { ErroDadosCidadaoInvalidos } from '../../Cidadao/CidadaoApplicationErrors';
import type { ListarCidadaosRequestDto } from '../../Cidadao/DTOs/Requests/ListarCidadaosRequestDto';
import { normalizarCpf, validarObjeto } from './CidadaoValidator';

const PAGINA_PADRAO = 1;
const TAMANHO_PAGINA_PADRAO = 20;
const TAMANHO_PAGINA_MAXIMO = 100;

function numeroInteiroPositivo(
  valor: number | string | undefined,
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
    throw new ErroDadosCidadaoInvalidos(campo, `${campo} deve ser um inteiro positivo.`);
  }

  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new ErroDadosCidadaoInvalidos(campo, `${campo} deve ser um inteiro positivo.`);
  }
  return numero;
}

export function validarListarCidadaos(input: unknown = {}): PaginacaoCidadao {
  const consulta = validarObjeto(input, ['pagina', 'tamanhoPagina', 'nome', 'cpf']) as ListarCidadaosRequestDto;
  const pagina = numeroInteiroPositivo(consulta.pagina, PAGINA_PADRAO, 'pagina');
  const tamanhoPagina = numeroInteiroPositivo(
    consulta.tamanhoPagina,
    TAMANHO_PAGINA_PADRAO,
    'tamanhoPagina'
  );
  if (tamanhoPagina > TAMANHO_PAGINA_MAXIMO) {
    throw new ErroDadosCidadaoInvalidos(
      'tamanhoPagina',
      `tamanhoPagina não pode ser maior que ${TAMANHO_PAGINA_MAXIMO}.`
    );
  }

  const filtros: FiltrosCidadao = {};
  if (consulta.nome !== undefined) {
    if (typeof consulta.nome !== 'string') {
      throw new ErroDadosCidadaoInvalidos('nome', 'nome deve ser texto.');
    }
    if (consulta.nome.trim()) filtros.nome = consulta.nome.trim();
  }
  if (consulta.cpf !== undefined) {
    if (typeof consulta.cpf !== 'string') {
      throw new ErroDadosCidadaoInvalidos('cpf', 'CPF deve ser texto.');
    }
    if (consulta.cpf.trim()) filtros.cpf = normalizarCpf(consulta.cpf);
  }

  if (!Number.isSafeInteger((pagina - 1) * tamanhoPagina)) {
    throw new ErroDadosCidadaoInvalidos('pagina', 'A pagina excede o intervalo permitido.');
  }
  return { pagina, limite: tamanhoPagina, filtros };
}
