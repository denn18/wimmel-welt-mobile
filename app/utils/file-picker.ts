import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export type PickedFile = {
  dataUrl: string;
  fileName: string;
  mimeType: string | null;
};

async function buildDataUrlFromAsset(asset: DocumentPicker.DocumentPickerAsset) {
  const mimeType = asset.mimeType || 'application/octet-stream';
  const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
  return {
    dataUrl: `data:${mimeType};base64,${base64}`,
    fileName: asset.name ?? 'upload',
    mimeType,
  } satisfies PickedFile;
}

export async function pickSingleFile({ type }: { type: string | string[] }) {
  const result = await DocumentPicker.getDocumentAsync({ type });
  if (result.canceled) return null;

  const asset = result.assets?.[0];
  if (!asset) return null;

  return buildDataUrlFromAsset(asset);
}

export async function pickMultipleFiles({ type }: { type: string | string[] }) {
  const result = await DocumentPicker.getDocumentAsync({ type, multiple: true });
  if (result.canceled) return [] as PickedFile[];

  const assets = result.assets ?? [];
  if (!assets.length) return [] as PickedFile[];

  const files: PickedFile[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const asset of assets) {
    // eslint-disable-next-line no-await-in-loop
    files.push(await buildDataUrlFromAsset(asset));
  }

  return files;
}
