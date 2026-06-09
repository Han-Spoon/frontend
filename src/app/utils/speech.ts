import type { Language } from '../App';

export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let voices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (ttsSupported) voices = window.speechSynthesis.getVoices();
}

if (ttsSupported) {
  refreshVoices();
  // 보이스 목록은 비동기로 로드된다(첫 호출 시 비어 있을 수 있음).
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (!voices.length) refreshVoices();
  const prefix = lang.slice(0, 2).toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    null
  );
}

/** 텍스트를 지정 언어 보이스로 읽는다(매칭 보이스를 명시 선택). */
export function speak(text: string, lang: string) {
  if (!ttsSupported || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

/** 앱 언어 → SpeechSynthesis BCP-47 태그 */
export const speechLang = (language: Language): string =>
  language === 'ko' ? 'ko-KR' : language === 'ar' ? 'ar-SA' : 'en-US';
