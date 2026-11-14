import type { FiltrosMulta, PaginacaoMultas } from '../../../Domain/CameraTransito/CameraTransitoRepository';
import { StatusMulta } from '../../../Domain/CameraTransito/Multa';
import { GravidadeCatalogoMulta } from '../../../Domain/CatalogoMulta/CatalogoMulta';
import type { ListarMultasRequestDto } from '../../CameraTransito/DTOs/Requests/ListarMultasRequestDto';
import { invalidar, validarDataComFuso, validarObjeto, validarPlaca, validarTexto, validarUuid } from './CameraTransitoValidator';

function inteiroPositivo(valor: unknown, padrao: number, campo: string): number {
  if (valor === undefined) return padrao;
  const numero = typeof valor === 'number' ? valor
    : typeof valor === 'string' && /^\d+$/.test(valor) ? Number(valor) : NaN;
  if (!Number.isSafeInteger(numero) || numero < 1) invalidar(campo, `${campo} deve ser um inteiro positivo.`);
  return numero;
}

export function validarListarMultas(input: unknown = {}): PaginacaoMultas {
  const consulta = validarObjeto(input, [
    'pagina', 'tamanhoPagina', 'placa', 'codigoCamera', 'catalogoMultaId', 'condutorId',
    'responsavelId', 'status', 'gravidade', 'dataInicial', 'dataFinal'
  ]) as ListarMultasRequestDto;
  const pagina = inteiroPositivo(consulta.pagina, 1, 'pagina');
  const limite = inteiroPositivo(consulta.tamanhoPagina, 20, 'tamanhoPagina');
  if (limite > 100) invalidar('tamanhoPagina', 'tamanhoPagina não pode ser maior que 100.');
  if (!Number.isSafeInteger((pagina - 1) * limite)) invalidar('pagina', 'A página excede o intervalo permitido.');

  const filtros: FiltrosMulta = {};
  if (consulta.placa !== undefined) filtros.placa = validarPlaca(consulta.placa);
  if (consulta.codigoCamera !== undefined) {
    filtros.codigoCamera = validarTexto(consulta.codigoCamera, 'codigoCamera', 50).toUpperCase();
    if (filtros.codigoCamera.length > 50) invalidar('codigoCamera', 'codigoCamera deve ter até 50 caracteres após normalização.');
  }
  for (const campo of ['catalogoMultaId', 'condutorId', 'responsavelId'] as const) {
    if (consulta[campo] !== undefined) filtros[campo] = validarUuid(consulta[campo], campo);
  }
  if (consulta.status !== undefined) {
    if (!Object.values(StatusMulta).includes(consulta.status as StatusMulta)) invalidar('status', 'Status da multa inválido.');
    filtros.status = consulta.status as StatusMulta;
  }
  if (consulta.gravidade !== undefined) {
    if (!Object.values(GravidadeCatalogoMulta).includes(consulta.gravidade as GravidadeCatalogoMulta)) invalidar('gravidade', 'Gravidade inválida.');
    filtros.gravidade = consulta.gravidade as GravidadeCatalogoMulta;
  }
  for (const campo of ['dataInicial', 'dataFinal'] as const) {
    if (consulta[campo] !== undefined) filtros[campo] = validarDataComFuso(consulta[campo], campo);
  }
  if (filtros.dataInicial && filtros.dataFinal && filtros.dataInicial > filtros.dataFinal) {
    invalidar('dataInicial', 'A data inicial não pode ser posterior à final.');
  }
  return { pagina, limite, filtros };
}
