const MAX_FILE_BYTES = 2 * 1024 * 1024;
const OUTPUT_SIZE = 128;
const JPEG_QUALITY = 0.82;

export function isSafeAvatarDataUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value);
}

export async function processAvatarImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem (JPEG, PNG ou WebP).');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('A imagem deve ter no máximo 2 MB.');
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem.');

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  if (dataUrl.length > 80_000) {
    throw new Error('Imagem muito grande após compressão. Tente outra foto.');
  }
  return dataUrl;
}
