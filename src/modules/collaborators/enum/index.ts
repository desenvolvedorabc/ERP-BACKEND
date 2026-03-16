export enum OccupationArea {
  PARC = "PARC",
  DDI = "DDI",
  DCE = "DCE",
  EPV = "EPV",
}

export enum EmploymentRelationship {
  CLT = "CLT",
  PJ = "PJ",
}

export enum RegistrationStatus {
  PRE_CADASTRO = "PRE_CADASTRO",
  CADASTRO_COMPLETO = "CADASTRO_COMPLETO",
}

export enum GenderIdentity {
  PREFIRO_NAO_RESPONDER = "PREFIRO_NAO_RESPONDER",
  HOMEM_CIS = "HOMEM_CIS",
  HOMEM_TRANS = "HOMEM_TRANS",
  MULHER_CIS = "MULHER_CIS",
  MULHER_TRANS = "MULHER_TRANS",
  TRAVESTI = "TRAVESTI",
  NAO_BINARIO = "NAO_BINARIO",
  OUTRO = "OUTRO",
}

export enum Race {
  AMARELO = "AMARELO",
  BRANCO = "BRANCO",
  PARDO = "PARDO",
  INDIGENA = "INDIGENA",
  PRETO = "PRETO",
  PREFIRO_NAO_RESPONDER = "PREFIRO_NAO_RESPONDER",
}

export enum FoodCategory {
  ONIVORO = "ONIVORO",
  VEGANO = "VEGANO",
  VEGETARIANO = "VEGETARIANO",
  PESCETARIANO = "PESCETARIANO",
  OUTRO = "OUTRO",
  PREFIRO_NAO_RESPONDER = "PREFIRO_NAO_RESPONDER",
}

export interface FoodCategoryOption {
  value: FoodCategory;
  label: string;
  description: string;
}

export const FOOD_CATEGORY_OPTIONS: FoodCategoryOption[] = [
  {
    value: FoodCategory.ONIVORO,
    label: "Onívoro",
    description: "Come de tudo (carnes, vegetais, laticínios, etc.)",
  },
  {
    value: FoodCategory.VEGANO,
    label: "Vegano",
    description: "Não consome nenhum produto de origem animal",
  },
  {
    value: FoodCategory.VEGETARIANO,
    label: "Vegetariano",
    description: "Não consome carnes, mas pode consumir laticínios e ovos",
  },
  {
    value: FoodCategory.PESCETARIANO,
    label: "Pescetariano",
    description: "Consome peixes e frutos do mar, mas não outras carnes",
  },
  {
    value: FoodCategory.OUTRO,
    label: "Outro",
    description: "Outra condição alimentar (especifique na descrição)",
  },
  {
    value: FoodCategory.PREFIRO_NAO_RESPONDER,
    label: "Prefiro não responder",
    description: "Não deseja informar sua condição alimentar",
  },
];

export enum Education {
  EDUCACAO_INFANTIL = "EDUCACAO_INFANTIL",
  ENSINO_FUNDAMENTAL = "ENSINO_FUNDAMENTAL",
  ENSINO_MEDIO = "ENSINO_MEDIO",
  ENSINO_SUPERIOR = "ENSINO_SUPERIOR",
  POS_GRADUACAO = "POS_GRADUACAO",
  MESTRADO = "MESTRADO",
  DOUTORADO = "DOUTORADO",
}

export enum DisableBy {
  DESLIGAMENTO_ABC = "DESLIGAMENTO_ABC",
  FALECIMENTO = "FALECIMENTO",
  TEMPO_CONTRATO_FINALIZADO = "TEMPO_CONTRATO_FINALIZADO",
  SOLICITACAO_RESCISAO_CONTRATUAL = "SOLICITACAO_RESCISAO_CONTRATUAL",
}
