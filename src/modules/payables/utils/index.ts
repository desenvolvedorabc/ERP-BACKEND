export function addLeadingZeros(valor: string | number, totalSize: number): string {
  const valorString = String(valor);
  const necessaryZeros = totalSize - valorString.length;
  
  if (necessaryZeros <= 0) {
    return valorString;
  }
  
  return '0'.repeat(necessaryZeros) + valorString;
}

export function isBradescoBarcode(barcode: string) {
  const cleanBarcode = barcode.replace(/\D/g, '');

  const bankCode = cleanBarcode.substring(0, 3);

  return bankCode === '237';
}