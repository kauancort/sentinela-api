import { normalizarCpf } from '../../../Domain/Cidadao/Cidadao';
import type {
  CidadaoRepository,
  FiltrosCidadao
} from '../../../Domain/Cidadao/CidadaoRepository';
import {
  ErroDadosCidadaoInvalidos,
  propagarErroCidadao
} from '../CidadaoApplicationErrors';
import type { ListarCidadaosRequestDto } from '../DTOs/Requests/ListarCidadaosRequestDto';
import { mapearCidadaoParaResponse } from '../DTOs/Responses/CidadaoResponseMapper';
import type { ListarCidadaosResponseDto } from '../DTOs/Responses/ListarCidadaosResponseDto';

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
  } else if (/^\d+$/.test(valor)) {
    numero = Number(valor);
  } else {
    throw new ErroDadosCidadaoInvalidos(campo, `${campo} deve ser um inteiro positivo.`);
  }

  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new ErroDadosCidadaoInvalidos(campo, `${campo} deve ser um inteiro positivo.`);
  }
  return numero;
}

export class ListarCidadaosHandler {
  constructor(private readonly cidadaos: CidadaoRepository) {}

  async execute(consulta: ListarCidadaosRequestDto = {}): Promise<ListarCidadaosResponseDto> {
    try {
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

      const resultado = await this.cidadaos.listar({
        pagina,
        limite: tamanhoPagina,
        filtros
      });

      return {
        itens: resultado.itens.map((cidadao) => mapearCidadaoParaResponse(cidadao)),
        total: resultado.total,
        pagina: resultado.pagina,
        tamanhoPagina: resultado.limite
      };
    } catch (erro) {
      if (erro instanceof RangeError) {
        throw new ErroDadosCidadaoInvalidos('pagina', erro.message);
      }
      propagarErroCidadao(erro);
    }
  }
}
