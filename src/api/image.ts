const DEFAULT_BLOB_IMAGE_BASE_URL = 'https://sthanspoonprod.blob.core.windows.net/menu-images';
const BLOB_IMAGE_BASE_URL = import.meta.env.VITE_BLOB_IMAGE_BASE_URL ?? DEFAULT_BLOB_IMAGE_BASE_URL;
const BLOB_IMAGE_SAS = import.meta.env.VITE_BLOB_IMAGE_SAS ?? '';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

function joinBlobUrl(fileName: string, ext: string) {
  const baseUrl = BLOB_IMAGE_BASE_URL.replace(/\/$/, '');
  const sas = BLOB_IMAGE_SAS && !BLOB_IMAGE_SAS.startsWith('?') ? `?${BLOB_IMAGE_SAS}` : BLOB_IMAGE_SAS;

  return `${baseUrl}/${encodeURIComponent(fileName)}.${ext}${sas}`;
}

function normalizeBlobFileName(fileName: string) {
  return fileName.trim().normalize('NFD');
}

function getBlobFileNameCandidates(fileName: string) {
  const normalized = normalizeBlobFileName(fileName);
  const withoutParentheses = normalizeBlobFileName(
    fileName.replace(/\s*[\(\[].*?[\)\]]\s*/g, ' ')
  );
  const withoutSpaces = normalizeBlobFileName(fileName.replace(/\s+/g, ''));

  return Array.from(new Set([normalized, withoutParentheses, withoutSpaces]))
    .filter((candidate) => candidate.length > 0);
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

  const fileNames = getBlobFileNameCandidates(fileNameWithoutExt);
  console.log('[MenuImage] blob lookup:', {
    originalFileName: fileNameWithoutExt,
    fileNames,
  });

  for (const fileName of fileNames) {
    for (const ext of IMAGE_EXTENSIONS) {
      const url = joinBlobUrl(fileName, ext);
      console.log('[MenuImage] trying image URL:', url);

      const exists = await canLoadImage(url);

      if (exists) {
        console.log('[MenuImage] found image URL:', url);
        return url;
      }
    }
  }

  console.log('[MenuImage] no blob image found:', fileNames);
  return null;
}
