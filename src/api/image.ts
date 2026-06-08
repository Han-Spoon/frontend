const BLOB_IMAGE_BASE_URL = import.meta.env.VITE_BLOB_IMAGE_BASE_URL;
const BLOB_IMAGE_SAS = import.meta.env.VITE_BLOB_IMAGE_SAS ?? '';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

function joinBlobUrl(fileName: string, ext: string) {
  const baseUrl = BLOB_IMAGE_BASE_URL.replace(/\/$/, '');
  const sas = BLOB_IMAGE_SAS && !BLOB_IMAGE_SAS.startsWith('?') ? `?${BLOB_IMAGE_SAS}` : BLOB_IMAGE_SAS;

  return `${baseUrl}/${encodeURIComponent(fileName)}.${ext}`;
}

function canLoadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);

    img.src = url;
  });
}

export async function findBlobImageByFileName(fileNameWithoutExt: string): Promise<string | null> {
  if (!BLOB_IMAGE_BASE_URL || !fileNameWithoutExt.trim()) {
    return null;
  }

  const fileName = fileNameWithoutExt.trim();

  for (const ext of IMAGE_EXTENSIONS) {
    const url = joinBlobUrl(fileName, ext);

    const exists = await canLoadImage(url);

    if (exists) {
      return url;
    }
  }

  return null;
}
