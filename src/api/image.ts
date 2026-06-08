const BLOB_IMAGE_BASE_URL = import.meta.env.VITE_BLOB_IMAGE_BASE_URL;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

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

  const encodedFileName = encodeURIComponent(fileNameWithoutExt.trim());

  for (const ext of IMAGE_EXTENSIONS) {
    const url = `${BLOB_IMAGE_BASE_URL}/${encodedFileName}.${ext}`;

    const exists = await canLoadImage(url);

    if (exists) {
      return url;
    }
  }

  return null;
}