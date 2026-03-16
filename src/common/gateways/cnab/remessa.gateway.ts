import { ArquivoTrailing } from "./layout/Bradesco/ArquivoTrailing";
import { ArquivoHeader } from "./layout/Bradesco/ArquivoHeader";
import { Injectable } from "@nestjs/common";
import {
  RemessaPagamento,
  RemessaPagamentoPix,
  RemessaRule,
} from "./layout/Rules";
import Utils from "./Utils";
import * as _ from "lodash";
import * as removeAccents from "remove-accents";
import { FieldConfig, LotePayment } from "./types";
import { CnabValidationError } from "src/modules/payables/errors/CnabErrors";
import { z } from "zod";
import { fieldConfigToZodSchema } from "./fieldConfigToZodSchema";

export type ProcessRemessaData = {
  ArquivoHeader: ArquivoHeader;
  lotes: LotePayment[];
  ArquivoTrailing: ArquivoTrailing;
};

@Injectable()
export class RemessaGateway {
  private rules: RemessaRule;

  private validate<T = object>(
    rulesName: Exclude<keyof RemessaRule, "type">,
    data: T,
  ): void {
    const rules = this.rules[rulesName];
    const schema = fieldConfigToZodSchema(rules);

    function formatFieldPath(paths: string[]) {
      return paths.map((path) => path.replace(/_/g, " ")).join(", ");
    }

    try {
      schema.parse(data);
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.error(
          `CNAB VALIDATION ERROR: No ${rulesName} o campo ${e.errors[0].path} ${e.errors[0].message}`,
        );
        throw new CnabValidationError(
          `Erro ao validar o arquivo de remessa, verifique se o campo ${formatFieldPath(e.errors.map((e) => e.path.toString()))} estão preenchidos corretamente nas contas a pagar`,
        );
      }
      throw e;
    }

    _.each(_.filter(rules, "default"), (config: FieldConfig) => {
      if (config.default.toString().length !== config.length) {
        throw new CnabValidationError(
          `O campo ${config.field.replace(/_/g, " ")} deve ter um comprimento menor ou igual a ${config.length} caracteres`,
        );
      }
    });

    // TODO: refatorar zod para fazer essa validação do max e includes por padrão
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const config = rules.find((rule) => rule.field === key);
      if (config && value?.toString()?.length > config.length) {
        throw new CnabValidationError(
          `${rulesName}-${key} deve ter um comprimento menor ou igual a ${config.length} caracteres`,
        );
      }
      if (config && config.includes && !config.includes.includes(value)) {
        throw new CnabValidationError(
          `${rulesName}-${key} deve ser um dos valores: ${config.includes.join(", ")}`,
        );
      }
    });
  }

  private prepare<T = object>(
    rulesName: Exclude<keyof RemessaRule, "type">,
    validated: T,
  ): FieldConfig[] {
    const utils = new Utils();
    const rules = _.cloneDeep(this.rules[rulesName]);
    for (const key in validated) {
      const value = validated[key];
      const fieldConfig = _.find(rules, { field: key });
      if (fieldConfig) {
        fieldConfig.value = value as unknown as string;
      }
    }

    // formats all fields to match the required length
    return _.map(rules, (item: FieldConfig) => {
      // we consider that the default values already have the correct length
      if (item.default != null && item.value == null) {
        return item;
      }
      // if there's no value (eg, non-required field with no default value)
      if (item.value == null) {
        const meaninglessChar = item.type === "alphanumeric" ? " " : "0";
        item.value = new Array(item.length).fill(meaninglessChar).join("");
      }
      // for now, when the field doesn't have a type, it defaults to numeric
      item.value =
        item.type === "alphanumeric"
          ? utils.padString(item)
          : utils.padNumber(item);
      return item;
    });
  }

  private build(prepared: FieldConfig[]): string {
    const base = Array(240);
    _.map(prepared, (fieldConfig: FieldConfig) => {
      const fieldValue =
        fieldConfig.value?.toString() || fieldConfig.default?.toString() || "";
      const args = [fieldConfig.startPos, fieldConfig.length].concat(
        // @ts-ignore
        fieldValue.toString().split(""),
      );
      base.splice.apply(base, args).join("");
    });
    base.shift();
    return base.join("");
  }

  process(
    fileData: ProcessRemessaData,
    type: "pagamento" | "pagamentoPix",
    newLine: string = "\r\n",
  ): string {
    if (type === "pagamento") {
      this.rules = RemessaPagamento;
    } else if (type === "pagamentoPix") {
      this.rules = RemessaPagamentoPix;
    } else {
      throw new CnabValidationError("Tipo de remessa não suportado");
    }

    const fileSections = ["ArquivoHeader", "lotes", "ArquivoTrailing"];

    // now we'll put the section key into each values object...
    const valuesArr = _.map(fileSections, (section) => {
      if (section === "lotes") {
        return _.map(fileData.lotes, (lote) => {
          const loteSections = ["LoteHeader", "Details", "LoteTrailing"];
          return _.map(loteSections, (loteSection) => {
            if (_.isArray(lote[loteSection])) {
              return _.map(lote[loteSection], (subsection) => {
                if (subsection.cod_seg_registro_lote === "A") {
                  subsection.section = "SegmentoA";
                } else if (
                  subsection.cod_seg_registro_lote === "B" &&
                  type === "pagamento"
                ) {
                  subsection.section = "SegmentoB";
                } else if (
                  subsection.cod_seg_registro_lote === "B" &&
                  type === "pagamentoPix"
                ) {
                  subsection.section = "SegmentoBPix";
                } else if (
                  subsection.cod_seg_registro_lote === "J"
                ) {
                  subsection.section = "SegmentoJ";
                } else if (
                  subsection.cod_seg_registro_lote === "J52"
                ) {
                  subsection.section = "SegmentoJ52";
                }
                
                else {
                  throw new CnabValidationError("Segmento não suportado");
                }

                return subsection;
              });
            } else if (lote[loteSection]) {
              lote[loteSection].section = loteSection;
              return lote[loteSection];
            }
          });
        });
      } else if (fileData[section]) {
        fileData[section].section = section;
        return fileData[section];
      }
    });

    //... and then flatten the array
    const sections = _.flattenDeep(
      valuesArr.filter((el) => el != null && el != undefined),
    );
    // process'em all!
    const remessa = _.map(sections, (section) => {
      const sectionKey = section.section;
      const sectionValues = _.omit(section, "section");
      this.validate(sectionKey, sectionValues);
      return this.build(this.prepare(sectionKey, sectionValues));
    });
    return removeAccents(remessa.join(newLine) + newLine);
  }
}
