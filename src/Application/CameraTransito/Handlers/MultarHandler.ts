import type { CameraTransitoRepository } from '../../../Domain/CameraTransito/CameraTransitoRepository';
import { ErroCatalogoMultaInativo, ErroOcorrenciaDuplicada } from '../../../Domain/CameraTransito/CameraTransitoErrors';
import { Multa } from '../../../Domain/CameraTransito/Multa';
import { PoliticaPontuacao } from '../../../Domain/CameraTransito/PoliticaPontuacao';
import type { CatalogoMultaRepository } from '../../../Domain/CatalogoMulta/CatalogoMultaRepository';
import { SituacaoCnh } from '../../../Domain/Cidadao/Cidadao';
import type { CidadaoRepository } from '../../../Domain/Cidadao/CidadaoRepository';
import type { VeiculoRepository } from '../../../Domain/Veiculo/VeiculoRepository';
import { validarMultar } from '../../Validator/CameraTransito/MultarValidator';
import { ErroRegistroCameraTransitoNaoEncontrado, propagarErroCameraTransito } from '../CameraTransitoApplicationErrors';
import type { MultarRequestDto } from '../DTOs/Requests/MultarRequestDto';
import type { MultarResponseDto } from '../DTOs/Responses/MultarResponseDto';
import { mapearMultaParaResponse } from '../DTOs/Responses/MultaResponseMapper';

export class MultarHandler {
  constructor(
    private readonly multas: CameraTransitoRepository,
    private readonly veiculos: VeiculoRepository,
    private readonly catalogo: CatalogoMultaRepository,
    private readonly cidadaos: CidadaoRepository
  ) {}

  async execute(dto: MultarRequestDto): Promise<MultarResponseDto> {
    try {
      const dados = validarMultar(dto);
      const veiculo = await this.veiculos.buscarPorPlaca(dados.placa);
      if (!veiculo) throw new ErroRegistroCameraTransitoNaoEncontrado('placa', 'Veículo não encontrado.');
      const catalogoMulta = await this.catalogo.buscarPorId(dados.catalogoMultaId);
      if (!catalogoMulta) throw new ErroRegistroCameraTransitoNaoEncontrado('catalogoMultaId', 'Item do catálogo não encontrado.');
      if (!catalogoMulta.ativo) throw new ErroCatalogoMultaInativo();
      if (await this.multas.buscarPorOcorrenciaId(dados.ocorrenciaId)) throw new ErroOcorrenciaDuplicada(dados.ocorrenciaId);
      const condutor = dados.condutorId ? await this.cidadaos.buscarPorId(dados.condutorId) : null;
      if (dados.condutorId && !condutor) throw new ErroRegistroCameraTransitoNaoEncontrado('condutorId', 'Condutor não encontrado.');

      const multa = Multa.criar({ ...dados, veiculo, catalogoMulta });
      const responsavel = multa.responsavelId === null ? null : multa.responsavelId === condutor?.id
        ? condutor : await this.cidadaos.buscarPorId(multa.responsavelId);
      if (multa.responsavelId && !responsavel) throw new ErroRegistroCameraTransitoNaoEncontrado('responsavelId', 'Responsável não encontrado.');
      const historico = responsavel?.possuiCnh && responsavel.situacaoCnh !== SituacaoCnh.SEM_HABILITACAO
        ? await this.multas.consultarHistoricoComputavel({
          responsavelId: responsavel.id,
          inicioExclusivo: PoliticaPontuacao.inicioJanela(multa.dataHoraOcorrencia),
          fimInclusivo: multa.dataHoraOcorrencia
        }) : [];
      const analise = PoliticaPontuacao.analisar(multa, historico, responsavel, condutor);
      await this.multas.salvar(multa);
      return {
        multa: mapearMultaParaResponse(multa),
        analise: { ...analise, dataReferencia: analise.dataReferencia.toISOString() },
        pendencias: multa.responsavelId === null ? [{
          codigo: 'IDENTIFICAR_CONDUTOR',
          mensagem: 'Identificação do condutor pendente; proprietário a contatar. Nenhuma notificação foi enviada. Não há rota de identificação nesta versão.',
          proprietarioId: multa.proprietarioIdNaOcorrencia
        }] : []
      };
    } catch (erro) {
      propagarErroCameraTransito(erro);
    }
  }
}
