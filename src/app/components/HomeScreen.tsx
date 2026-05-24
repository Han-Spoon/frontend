import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, Camera, ImageIcon, RotateCcw, User } from 'lucide-react';
import type { Language, PendingMenuImage } from '../App';
import logo from '../../icons/logo.png';

interface HomeScreenProps {
  language: Language;
  onScan: (image: PendingMenuImage) => void;
  onHistory: (item: any) => void;
  onMyPage: () => void;
  history: any[];
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function HomeScreen({ language, onScan, onHistory, onMyPage, history }: HomeScreenProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedImage, setSelectedImage] = useState<PendingMenuImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraStream(null);
  };

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const setPreview = (image: PendingMenuImage, revokePrevious = true) => {
    if (revokePrevious) {
      clearObjectUrl();
    }
    setSelectedImage(image);
    setErrorMessage(null);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraDenied(true);
      setErrorMessage(t(
        '이 브라우저에서는 카메라를 바로 열 수 없어요. 사진을 선택해서 분석해 주세요.',
        'This browser cannot open the camera here. Please choose a photo instead.'
      ));
      return;
    }

    try {
      setIsStartingCamera(true);
      setCameraDenied(false);
      setErrorMessage(null);
      setSelectedImage(null);
      clearObjectUrl();
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraStream(stream);
    } catch (error) {
      setCameraDenied(true);
      setErrorMessage(t(
        '카메라 권한이 거부되어 촬영할 수 없어요. 브라우저 설정에서 카메라 권한을 허용하거나, 아래에서 메뉴판 사진을 선택해 주세요.',
        'Camera permission was denied. Allow camera access in your browser settings, or choose a menu photo below.'
      ));
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleCameraClick = () => {
    void startCamera();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const validateImageFile = (file: File) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return t(
        '사진 파일만 업로드할 수 있어요. JPG, PNG, WEBP 형식만 지원하며 GIF, 영상, 문서는 사용할 수 없습니다.',
        'Only photo files are supported. Use JPG, PNG, or WEBP. GIFs, videos, and documents are not allowed.'
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return t(
        `이미지는 ${MAX_FILE_SIZE_MB}MB 이하만 업로드할 수 있어요.`,
        `Images must be ${MAX_FILE_SIZE_MB}MB or smaller.`
      );
    }

    return null;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    stopCamera();
    clearObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreview({
      file,
      previewUrl: objectUrl,
      source: 'upload',
    }, false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setErrorMessage(t(
        '카메라 화면을 아직 준비 중이에요. 잠시 후 다시 촬영해 주세요.',
        'The camera is still getting ready. Please try again in a moment.'
      ));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setErrorMessage(t(
        '사진을 만들 수 없어요. 사진 선택으로 다시 시도해 주세요.',
        'Could not capture a photo. Please try choosing a photo instead.'
      ));
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setErrorMessage(t(
          '사진을 만들 수 없어요. 사진 선택으로 다시 시도해 주세요.',
          'Could not capture a photo. Please try choosing a photo instead.'
        ));
        return;
      }

      stopCamera();
      clearObjectUrl();
      const file = new File([blob], `menu-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreview({
        file,
        previewUrl: objectUrl,
        source: 'camera',
      }, false);
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    void startCamera();
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    stopCamera();
    if (objectUrlRef.current === selectedImage.previewUrl) {
      objectUrlRef.current = null;
    }
    onScan(selectedImage);
  };

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    clearObjectUrl();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            <img src={logo} alt="한스푼 로고" className="w-6 h-6 object-contain" />
          </span>
          <span className="font-semibold">{t('한 스푼', 'Han Spoon')}</span>
        </div>
        <button
          onClick={onMyPage}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <User className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t('메뉴판을 찍으면', 'Scan a menu')}</h2>
          <p className="text-sm text-neutral-600">{t('먹을 수 있는 메뉴를 알려드려요', 'We tell you what is safe to eat')}</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="mb-4">
          {selectedImage ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              <img src={selectedImage.previewUrl} alt={t('선택한 메뉴판 미리보기', 'Selected menu preview')} className="w-full h-64 object-cover" />
            </div>
          ) : cameraStream ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
            </div>
          ) : (
            <button
              onClick={handleCameraClick}
              disabled={isStartingCamera}
              className="w-full h-48 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-neutral-100 hover:border-neutral-400 transition-colors disabled:opacity-60"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Camera className="w-7 h-7 text-neutral-700" />
              </div>
              <span className="text-base font-medium text-neutral-900">
                {isStartingCamera ? t('카메라 여는 중', 'Opening camera') : t('메뉴판 촬영하기', 'Take a menu photo')}
              </span>
            </button>
          )}
        </div>

        {cameraStream && !selectedImage && (
          <button
            onClick={capturePhoto}
            className="w-full h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center gap-2 mb-3 hover:bg-neutral-800 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">{t('촬영하기', 'Capture photo')}</span>
          </button>
        )}

        {selectedImage && (
          <div className="mb-3">
            <button
              onClick={handleRetake}
              className="w-full h-12 bg-white border border-neutral-300 rounded-xl flex items-center justify-center gap-2 mb-3 hover:bg-neutral-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-neutral-600" />
              <span className="text-sm text-neutral-700">{t('다시 촬영', 'Retake')}</span>
            </button>
          </div>
        )}

        <button
          onClick={handleGalleryClick}
          className="w-full h-12 bg-white border border-neutral-300 rounded-xl flex items-center justify-center gap-2 mb-3 hover:bg-neutral-50 transition-colors"
        >
          <ImageIcon className="w-5 h-5 text-neutral-600" />
          <span className="text-sm text-neutral-700">{t('사진에서 선택하기', 'Choose from photos')}</span>
        </button>

        <p className="text-xs text-neutral-500 mb-4">
          {t(
            `JPG, PNG, WEBP 사진만 가능 · 최대 ${MAX_FILE_SIZE_MB}MB · GIF/영상/문서는 불가`,
            `JPG, PNG, WEBP photos only · Max ${MAX_FILE_SIZE_MB}MB · No GIFs, videos, or documents`
          )}
        </p>

        {cameraDenied && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                {t(
                  '카메라 권한이 없으면 촬영 기능은 사용할 수 없어요. 브라우저 설정에서 카메라를 허용하거나, 메뉴판 사진을 선택해 분석을 계속할 수 있습니다.',
                  'Without camera permission, capture is unavailable. Allow camera access in browser settings, or choose a menu photo to continue.'
                )}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-900 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {selectedImage && (
          <button
            onClick={handleAnalyze}
            className="w-full h-14 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors mb-8"
          >
            {t('분석 시작', 'Start analysis')}
          </button>
        )}

        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">{t('최근 분석 기록', 'Recent analysis')}</h3>
            <div className="space-y-2">
              {history.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={() => onHistory(item)}
                  className="w-full p-4 bg-neutral-50 rounded-xl flex items-center justify-between hover:bg-neutral-100 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                    <div className="text-xs text-neutral-600 mt-1">
                      {language === 'ko'
                        ? `메뉴 ${item.menuCount}개 분석`
                        : `Analyzed ${item.menuCount} items`}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">{t('손글씨 메뉴판은 인식이 어려울 수 있어요', 'Handwritten menus may be hard to recognize')}</p>
        </div>
      </div>
    </div>
  );
}
