import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseNumericIdPipe implements PipeTransform {
  transform(value: string) {
    const id = Number(value);
    if (isNaN(id)) {
      throw new BadRequestException("Id enviado não é um número válido");
    }
    return id;
  }
}
