import { invalidar, validarDataComFuso, validarObjeto, validarPlaca, validarTexto, validarUuid } from './CameraTransitoValidator';

export function validarMultar(input: unknown) {
  const obrigatorios = ['ocorrenciaId', 'codigoCamera', 'placa', 'catalogoMultaId', 'dataHoraOcorrencia', 'local'];
  const dados = validarObjeto(input, [...obrigatorios, 'condutorId'], obrigatorios);
  const data = validarDataComFuso(dados.dataHoraOcorrencia, 'dataHoraOcorrencia');
  if (data > new Date()) {
    invalidar('dataHoraOcorrencia', 'A ocorrência deve ter data real, dentro do intervalo do banco e não futura.');
  }
  return {
    ocorrenciaId: validarUuid(dados.ocorrenciaId, 'ocorrenciaId'),
    codigoCamera: validarTexto(dados.codigoCamera, 'codigoCamera', 50).toUpperCase(),
    placa: validarPlaca(dados.placa),
    catalogoMultaId: validarUuid(dados.catalogoMultaId, 'catalogoMultaId'),
    condutorId: dados.condutorId == null ? null : validarUuid(dados.condutorId, 'condutorId'),
    dataHoraOcorrencia: data,
    local: validarTexto(dados.local, 'local', 200)
  };
}
