import { GravidadeCatalogoMulta, ResponsabilidadeCatalogoMulta } from '../../../Domain/CatalogoMulta/CatalogoMulta';
import type { PaginacaoCatalogoMulta } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { ErroDadosCatalogoMultaInvalidos } from '../../CatalogoMulta/CatalogoMultaApplicationErrors';
import {
  validarBooleanoConsulta,
  validarInteiroConsulta,
  validarObjetoCatalogoMulta
} from './CatalogoMultaValidator';

const CAMPOS = ['pagina', 'tamanhoPagina', 'codigo', 'descricao', 'gravidade', 'responsabilidade', 'ativo'];

function textoOpcional(valor: unknown, campo: string): string | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new ErroDadosCatalogoMultaInvalidos(campo, `${campo} deve ser um texto não vazio.`);
  }
  return valor.trim();
}

export function validarListarCatalogoMultas(input: unknown): PaginacaoCatalogoMulta {
  const dados = validarObjetoCatalogoMulta(input, CAMPOS);
  const gravidade = textoOpcional(dados.gravidade, 'gravidade') as GravidadeCatalogoMulta | undefined;
  if (gravidade !== undefined && !Object.values(GravidadeCatalogoMulta).includes(gravidade)) {
    throw new ErroDadosCatalogoMultaInvalidos('gravidade', 'gravidade não é válida.');
  }
  const responsabilidade = textoOpcional(dados.responsabilidade, 'responsabilidade') as ResponsabilidadeCatalogoMulta | undefined;
  if (responsabilidade !== undefined && !Object.values(ResponsabilidadeCatalogoMulta).includes(responsabilidade)) {
    throw new ErroDadosCatalogoMultaInvalidos('responsabilidade', 'responsabilidade não é válida.');
  }
  return {
    pagina: validarInteiroConsulta(dados.pagina, 'pagina', 1),
    limite: validarInteiroConsulta(dados.tamanhoPagina, 'tamanhoPagina', 20, 100),
    filtros: {
      codigo: textoOpcional(dados.codigo, 'codigo')?.toUpperCase(),
      descricao: textoOpcional(dados.descricao, 'descricao'),
      gravidade,
      responsabilidade,
      ativo: validarBooleanoConsulta(dados.ativo, 'ativo')
    }
  };
}
