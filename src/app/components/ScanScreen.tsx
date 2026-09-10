import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, Camera, ImageIcon, RotateCcw, User, MapPin, ChevronRight } from 'lucide-react';
import { RestaurantPicker } from './discovery/RestaurantPicker';
import { RESTAURANTS } from '../demo/restaurants';
import { useDemoValue } from '../demo/storage';
import { localizeMenuText } from '../results/resultViewModel';
import type { HistoryItem, Language, PendingMenuImage } from '../App';
import logo from '../../assets/brand/han-spoon-logo.svg';
import { BottomNav } from './BottomNav';
import { ScanHistoryList } from './ScanHistoryList';
import { uploadImage } from '../../api/upload';
import { createTranslator } from '../locales';

interface HomeScreenProps {
  demoMode?: boolean;
  language: Language;
  onScan: (image: PendingMenuImage) => void;
  onHistory: (item: HistoryItem) => void;
  onMyPage: () => void;
  history: HistoryItem[];
  onDeleteHistory: (id: string) => void;
  onRenameHistory: (id: string, title: string) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ScanScreen({ language, onScan, onHistory, onMyPage, history, onDeleteHistory, onRenameHistory, demoMode = false }: HomeScreenProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedImage, setSelectedImage] = useState<PendingMenuImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [restaurantId, setRestaurantId] = useDemoValue<string | null>('selected-restaurant', null);
  const [restaurantPicker, setRestaurantPicker] = useState(false);
  const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const t = createTranslator(language);

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
        'This browser cannot open the camera here. Please choose a photo instead.',
        'لا يمكن لهذا المتصفح فتح الكاميرا هنا. يرجى اختيار صورة بدلا من ذلك.'
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
        'Camera permission was denied. Allow camera access in your browser settings, or choose a menu photo below.',
        'تم رفض إذن الكاميرا. اسمح بالوصول إلى الكاميرا من إعدادات المتصفح أو اختر صورة قائمة الطعام أدناه.'
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
        'Only photo files are supported. Use JPG, PNG, or WEBP. GIFs, videos, and documents are not allowed.',
        'يمكن رفع ملفات الصور فقط. استخدم JPG أو PNG أو WEBP. لا يمكن استخدام GIF أو الفيديوهات أو المستندات.'
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return t(
        `이미지는 ${MAX_FILE_SIZE_MB}MB 이하만 업로드할 수 있어요.`,
        `Images must be ${MAX_FILE_SIZE_MB}MB or smaller.`,
        `يجب أن يكون حجم الصورة ${MAX_FILE_SIZE_MB}MB أو أقل.`
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
        'The camera is still getting ready. Please try again in a moment.',
        'لا تزال الكاميرا قيد التجهيز. يرجى المحاولة مرة أخرى بعد قليل.'
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
        'Could not capture a photo. Please try choosing a photo instead.',
        'تعذر التقاط الصورة. يرجى المحاولة عبر اختيار صورة بدلا من ذلك.'
      ));
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setErrorMessage(t(
          '사진을 만들 수 없어요. 사진 선택으로 다시 시도해 주세요.',
          'Could not capture a photo. Please try choosing a photo instead.',
          'تعذر التقاط الصورة. يرجى المحاولة عبر اختيار صورة بدلا من ذلك.'
        ));
        return;
      }

      stopCamera();
      clearObjectUrl();
      const file = new File([blob], `board-${Date.now()}.jpg`, { type: 'image/jpeg' });
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

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      setErrorMessage(null);

      const uploaded = selectedImage.file && !demoMode ? await uploadImage(selectedImage.file) : null;
      const imageForAnalysis: PendingMenuImage = uploaded
        ? {
            ...selectedImage,
            storage: {
              provider: 's3',
              key: uploaded.key,
            },
          }
        : selectedImage;

      stopCamera();
      if (objectUrlRef.current === selectedImage.previewUrl) {
        objectUrlRef.current = null;
      }
      onScan(imageForAnalysis);
    } catch (error) {
      setErrorMessage(t(
        '이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.',
        'Image upload failed. Please try again in a moment.',
        'فشل رفع الصورة. يرجى المحاولة مرة أخرى بعد قليل.'
      ));
    } finally {
      setIsUploading(false);
    }
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
    <div className="h-dvh flex flex-col bg-rice-cream text-soy-ink">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center justify-between px-5 flex-shrink-0 backdrop-blur">
        <img src={logo} alt={t('한스푼', 'Han Spoon', 'هان سبون')} className="h-auto w-[108px]" />
        <button
          onClick={onMyPage}
          className="w-11 h-11 rounded-full bg-brand-green-50 flex items-center justify-center text-brand-green-700 hover:bg-brand-green-100 transition-colors"
          aria-label={t('마이페이지', 'My page', 'صفحتي')}
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-7">
        <button onClick={() => setRestaurantPicker(true)} className="mb-5 flex min-h-14 w-full items-center gap-2 rounded-2xl border border-border-warm bg-rice-white px-3 text-start text-sm"><MapPin className="size-4 shrink-0 text-brand-primary" /><span className="flex-1 font-semibold">{restaurant ? localizeMenuText(restaurant.name, language) : t('식당 선택 · 나중에 해도 괜찮아요', 'Choose a restaurant · or do it later', 'اختر مطعماً · أو أضفه لاحقاً')}</span><ChevronRight className="size-4 rtl:rotate-180" /></button>
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-brand-accent-soft px-3 py-1.5 text-xs font-bold text-accent-foreground">
            {t('메뉴판 스캔', 'Menu scan', 'مسح القائمة')}
          </div>
          <h2 className="text-[26px] font-extrabold leading-[1.3] tracking-[-0.02em] text-soy-ink">
            {t('오늘의 메뉴를\n안심하고 골라보세요', 'Choose today’s meal\nwith confidence', 'اختر وجبتك اليوم\nبكل ثقة').split('\n').map((line, index, lines) => (
              <span key={line}>
                {line}
                {index < lines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="text-sm leading-6 text-sesame-gray mt-3">
            {t(
              '메뉴판 전체가 보이도록 정면에서 찍으면 더 정확해요.',
              'For better results, capture the full menu straight on.',
              'لنتائج أدق، التقط صورة القائمة كاملة من الأمام.'
            )}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="mb-4 rounded-[28px] border border-border-warm bg-rice-white p-3 shadow-[0_12px_36px_rgba(54,70,60,0.08)]">
          {selectedImage ? (
            <div className="overflow-hidden rounded-[var(--radius-control)] border border-border-warm bg-surface-subtle">
              <img src={selectedImage.previewUrl} alt={t('선택한 메뉴판 미리보기', 'Selected menu preview', 'معاينة قائمة الطعام المحددة')} className="w-full h-64 object-cover" />
            </div>
          ) : cameraStream ? (
            <div className="relative overflow-hidden rounded-[20px] border border-brand-green-100 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/10" />
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.18)]">
                <div className="absolute -top-0.5 -left-0.5 h-8 w-8 rounded-tl-xl border-t-4 border-l-4 border-white" />
                <div className="absolute -top-0.5 -right-0.5 h-8 w-8 rounded-tr-xl border-t-4 border-r-4 border-white" />
                <div className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-white" />
                <div className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-white" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleCameraClick}
              disabled={isStartingCamera}
              className="flex h-52 w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-control)] border-2 border-dashed border-border-warm bg-surface-subtle hover:border-brand-primary hover:bg-surface-interactive disabled:opacity-60"
            >
              <div className="flex size-14 rotate-[-3deg] items-center justify-center rounded-2xl bg-brand-primary shadow-[0_10px_24px_rgba(23,100,73,0.18)]">
                <Camera className="size-6 rotate-[3deg] text-white" />
              </div>
              <span className="text-base font-bold text-brand-green-900">
                {isStartingCamera ? t('카메라 여는 중', 'Opening camera', 'جار فتح الكاميرا') : t('메뉴판 촬영하기', 'Take a menu photo', 'التقط صورة للقائمة')}
              </span>
              <span className="text-xs text-sesame-gray">{t('카메라가 바로 열려요', 'Your camera opens right away', 'ستفتح الكاميرا مباشرة')}</span>
            </button>
          )}
        </div>

        {cameraStream && !selectedImage && (
          <button
            onClick={capturePhoto}
            className="w-full h-13 bg-brand-green-700 text-white rounded-2xl flex items-center justify-center gap-2 mb-3 hover:bg-brand-green-900 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">{t('촬영하기', 'Capture photo', 'التقاط صورة')}</span>
          </button>
        )}

        {selectedImage && (
          <div className="mb-3">
            <button
              onClick={handleRetake}
              className="w-full h-12 bg-rice-white border border-border-warm rounded-2xl flex items-center justify-center gap-2 mb-3 hover:bg-brand-green-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-brand-green-700" />
              <span className="text-sm font-semibold text-brand-green-900">{t('다시 촬영', 'Retake', 'إعادة الالتقاط')}</span>
            </button>
          </div>
        )}

        <button
          onClick={handleGalleryClick}
          className="w-full h-12 bg-rice-white border border-border-warm rounded-2xl flex items-center justify-center gap-2 mb-3 hover:bg-brand-green-50 transition-colors"
        >
          <ImageIcon className="w-5 h-5 text-brand-green-700" />
          <span className="text-sm font-semibold text-brand-green-900">{t('사진에서 선택하기', 'Choose from photos', 'اختر من الصور')}</span>
        </button>

        <p className="text-xs leading-5 text-sesame-gray mb-4 px-1">
          {t(
            `JPG, PNG, WEBP 사진만 가능 · 최대 ${MAX_FILE_SIZE_MB}MB · GIF/영상/문서는 불가`,
            `JPG, PNG, WEBP photos only · Max ${MAX_FILE_SIZE_MB}MB · No GIFs, videos, or documents`,
            `صور JPG وPNG وWEBP فقط · الحد الأقصى ${MAX_FILE_SIZE_MB}MB · لا GIF أو فيديوهات أو مستندات`
          )}
        </p>

        {cameraDenied && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                {t(
                  '카메라 권한이 없으면 촬영 기능은 사용할 수 없어요. 브라우저 설정에서 카메라를 허용하거나, 메뉴판 사진을 선택해 분석을 계속할 수 있습니다.',
                  'Without camera permission, capture is unavailable. Allow camera access in browser settings, or choose a menu photo to continue.',
                  'بدون إذن الكاميرا، لا يمكن استخدام التصوير. اسمح بالكاميرا من إعدادات المتصفح أو اختر صورة قائمة للمتابعة.'
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
            disabled={isUploading}
            className="mb-8 min-h-12 w-full rounded-xl bg-brand-primary font-bold text-white shadow-[0_10px_24px_rgba(23,100,73,0.16)] hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-surface-interactive disabled:text-text-tertiary"
          >
            {isUploading
              ? t('이미지 업로드 중', 'Uploading image', 'جار رفع الصورة')
              : t('분석 시작', 'Start analysis', 'بدء التحليل')}
          </button>
        )}

        {history.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-soy-ink mb-3">{t('최근에 살펴본 메뉴', 'Recently viewed menus', 'القوائم التي شاهدتها مؤخراً')}</h3>
            <ScanHistoryList
              language={language}
              history={history.slice(0, 3)}
              onOpen={onHistory}
              onDelete={onDeleteHistory}
              onRename={onRenameHistory}
            />
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-sesame-gray">{t('손글씨 메뉴판은 인식이 어려울 수 있어요', 'Handwritten menus may be hard to recognize', 'قد يصعب التعرف على قوائم الطعام المكتوبة بخط اليد')}</p>
        </div>
      </div>

      <BottomNav language={language} />
      {restaurantPicker && <RestaurantPicker language={language} selectedId={restaurantId} onClose={() => setRestaurantPicker(false)} onSelect={r => { setRestaurantId(r?.id ?? null); setRestaurantPicker(false); }} />}
    </div>
  );
}
