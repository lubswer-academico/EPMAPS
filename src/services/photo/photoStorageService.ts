import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory || ''}epmaps_photos/`;

/**
 * Asegura la existencia del directorio permanente de fotos.
 */
export async function ensurePhotosDirectoryExists(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIRECTORY, { intermediates: true });
    }
  } catch (error) {
    console.error('Error al asegurar directorio de fotos:', error);
  }
}

/**
 * Persiste una imagen temporal en el directorio protegido permanente de la app con un nombre único por medidor.
 * Retorna la URI permanente del archivo.
 */
export async function persistPhoto(tempUri: string, meterCode: string): Promise<string> {
  await ensurePhotosDirectoryExists();
  const timestamp = Date.now();
  const sanitizedCode = meterCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizedCode}_${timestamp}.jpg`;
  const permanentUri = `${PHOTOS_DIRECTORY}${filename}`;

  try {
    await FileSystem.copyAsync({
      from: tempUri,
      to: permanentUri,
    });
    return permanentUri;
  } catch (error) {
    console.error(`Error al persistir la foto desde ${tempUri} hacia ${permanentUri}:`, error);
    throw error;
  }
}

/**
 * Elimina un archivo de foto huérfano de manera segura cuando se reemplaza o se descarta un borrador.
 */
export async function deletePhoto(photoUri?: string | null): Promise<void> {
  if (!photoUri) return;
  try {
    const fileInfo = await FileSystem.getInfoAsync(photoUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(photoUri, { idempotent: true });
    }
  } catch (error) {
    console.error(`Error al eliminar fotografía huérfana en ${photoUri}:`, error);
  }
}
