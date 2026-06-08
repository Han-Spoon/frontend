const BLOB_IMAGE_BASE_URL = import.meta.env.VITE_BLOB_IMAGE_BASE_URL;
const BLOB_IMAGE_SAS = import.meta.env.VITE_BLOB_IMAGE_SAS ?? '';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

function joinBlobUrl(fileName: string, ext: string) {
  const baseUrl = BLOB_IMAGE_BASE_URL.replace(/\/$/, '');
  const sas = BLOB_IMAGE_SAS && !BLOB_IMAGE_SAS.startsWith('?') ? `?${BLOB_IMAGE_SAS}` : BLOB_IMAGE_SAS;

  return `${baseUrl}/${encodeURIComponent(fileName)}.${ext}${sas}`;
}

function normalizeBlobFileName(fileName: string) {
  return fileName.trim().normalize('NFD');
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
    console.log('[MenuImage] skip blob lookup:', {
      hasBaseUrl: Boolean(BLOB_IMAGE_BASE_URL),
      fileName: fileNameWithoutExt,
    });
    return null;
  }

  const fileName = normalizeBlobFileName(fileNameWithoutExt);
  console.log('[MenuImage] blob lookup:', {
    originalFileName: fileNameWithoutExt,
    normalizedFileName: fileName,
  });

  for (const ext of IMAGE_EXTENSIONS) {
    const url = joinBlobUrl(fileName, ext);
    console.log('[MenuImage] trying image URL:', url);

    const exists = await canLoadImage(url);

    if (exists) {
      console.log('[MenuImage] found image URL:', url);
      return url;
    }
  }

  console.log('[MenuImage] no blob image found:', fileName);
  return null;
}
