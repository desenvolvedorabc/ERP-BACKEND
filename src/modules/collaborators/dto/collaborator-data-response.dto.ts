import { ApiProperty } from "@nestjs/swagger";

export class CollaboratorDataResponseDto {
  @ApiProperty({ description: "Nome do colaborador" })
  nome: string;

  @ApiProperty({ description: "Nome do contato de emergência" })
  nome_contato_emergencia: string;

  @ApiProperty({ description: "Email do colaborador" })
  email: string;

  @ApiProperty({ description: "Telefone do colaborador" })
  telefone: string;

  @ApiProperty({ description: "Telefone do contato de emergência" })
  telefone_contato_emergencia: string;

  @ApiProperty({ description: "CPF do colaborador" })
  cpf: string;

  @ApiProperty({ description: "RG do colaborador" })
  rg: string;

  @ApiProperty({ description: "Status do cadastro" })
  status_cadastro: string;

  @ApiProperty({ description: "Se o colaborador está ativo" })
  ativo: string;

  @ApiProperty({ description: "Motivo da desativação" })
  desativador_por: string;

  @ApiProperty({ description: "Área de ocupação/Programa" })
  programa: string;

  @ApiProperty({ description: "Função do colaborador" })
  funcao: string;

  @ApiProperty({ description: "Data de início do contrato" })
  inicio_contrato: string;

  @ApiProperty({ description: "Data de nascimento" })
  data_nascimento: string;

  @ApiProperty({ description: "Endereço completo" })
  endereco_completo: string;

  @ApiProperty({ description: "Vínculo empregatício" })
  vinculo_empregaticio: string;

  @ApiProperty({ description: "Identidade de gênero" })
  identidade_de_genero: string;

  @ApiProperty({ description: "Raça/Cor" })
  raca_cor: string;

  @ApiProperty({ description: "Alergias" })
  alergias: string;

  @ApiProperty({ description: "Categoria alimentar" })
  categoria_alimentar: string;

  @ApiProperty({ description: "Descrição da categoria alimentar" })
  descricao_categoria_alimentar: string;

  @ApiProperty({ description: "Escolaridade" })
  escolaridade: string;

  @ApiProperty({ description: "Experiência no setor público" })
  experiencia_setor_publico: string;

  @ApiProperty({ description: "Biografia" })
  biografia: string;

  @ApiProperty({
    description: "Histórico de alterações do colaborador",
    type: "array",
    required: false,
  })
  history?: any[];
}

