import * as _ from "lodash";
import { Injectable } from "@nestjs/common";
import { RetornoRule } from "./layout/Rules";

interface Rule {
  field: string;
  startPos: number;
  endPos: number;
}

@Injectable()
export class RetornoGateway {
  private FILE_HEADER = "ArquivoHeader";
  private FILE_TRAILING = "ArquivoTrailing";
  private LOT_HEADER = "LoteHeader";
  private LOT_TRAILING = "LoteTrailing";

  private FILE_SECTIONS = {
    FILE_HEADER: "0",
    LOT_HEADER: "1",
    DETAIL: "E",
    LOT_TRAILING: "5",
    FILE_TRAILING: "9",
  };

  private rules: any;

  constructor() {
    this.rules = {
      ArquivoHeader: RetornoRule.ArquivoHeader,
      ArquivoTrailing: RetornoRule.ArquivoTrailing,
      Detail: RetornoRule.Detail,
      LoteHeader: RetornoRule?.LoteHeader,
      LoteTrailing: RetornoRule?.LoteTrailing,
    };
  }

  private extractSingleField(line: string, rule: Rule): string | undefined {
    return line ? line.slice(rule.startPos - 1, rule.endPos) : undefined;
  }

  private extractSection(
    lines: string[],
    sectionName: string,
    sectionCode: string,
  ): string | undefined {
    const registryRule = _.find(this.rules[sectionName], {
      field: "registro",
    });
    const line = _.find(
      lines,
      (line) => this.extractSingleField(line, registryRule) === sectionCode,
    );
    _.pull(lines, line);
    return line;
  }

  extractBulk(lines, rule, condition) {
    return _.reduce(
      lines,
      (memo, line) => {
        const currentPos = memo.length === 0 ? 0 : memo.length - 1;
        if (this.extractSingleField(line, rule) === condition) {
          memo.push([]);
          memo[memo.length - 1].push(line);
        } else {
          if (memo[currentPos] != null) {
            memo[currentPos].push(line);
          }
        }
        return memo;
      },
      [],
    );
  }

  private extractFields(
    line: string,
    sectionName: string,
  ): Record<string, string> {
    const localRules = this.rules[sectionName];
    return _.reduce(
      localRules,
      (extracted, rule) => {
        extracted[rule.field] = this.extractSingleField(line, rule);
        return extracted;
      },
      {},
    );
  }

  extractSegments(detailLines) {
    return _.reduce(
      detailLines,
      (memo, detailLine) => {
        memo.push(this.extractFields(detailLine, "Detail"));
        return memo;
      },
      [],
    );
  }

  extractDetails(lotLines) {
    const lotHeaderLine = this.extractSection(
      lotLines,
      this.LOT_HEADER,
      this.FILE_SECTIONS.LOT_HEADER,
    );
    const lotTrailingLine = this.extractSection(
      lotLines,
      this.LOT_TRAILING,
      this.FILE_SECTIONS.LOT_TRAILING,
    );
    const detailsBulks = this.extractBulk(
      lotLines,
      _.find(this.rules.Detail, {
        field: "cod_seg_registro_lote",
      }),
      "E",
    );
    const detailsWithSegments = _.map(
      detailsBulks,
      this.extractSegments.bind(this),
    );
    return {
      [this.LOT_HEADER]: this.extractFields(lotHeaderLine, this.LOT_HEADER),
      details: detailsWithSegments,
      [this.LOT_TRAILING]: this.extractFields(
        lotTrailingLine,
        this.LOT_TRAILING,
      ),
    };
  }

  extract(fileString: string): Record<string, any> {
    const lines = _.compact(fileString.split("\n"));

    const fileHeaderLine = this.extractSection(
      lines,
      this.FILE_HEADER,
      this.FILE_SECTIONS.FILE_HEADER,
    );
    const fileTrailingLine = this.extractSection(
      lines,
      this.FILE_TRAILING,
      this.FILE_SECTIONS.FILE_TRAILING,
    );

    const lots = this.extractBulk(
      lines,
      _.find(this.rules.LoteHeader, { field: "registro" }),
      this.FILE_SECTIONS.LOT_HEADER,
    );
    const lotsWithSegments = _.map(lots, this.extractDetails.bind(this));

    return {
      [this.FILE_HEADER]: this.extractFields(fileHeaderLine, this.FILE_HEADER),
      lots: lotsWithSegments,
      [this.FILE_TRAILING]: this.extractFields(
        fileTrailingLine,
        this.FILE_TRAILING,
      ),
    };
  }
}
