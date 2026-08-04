import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceLang = 'fa-IR' | 'en-US';

// ── utils ذخیره زبان در localStorage ──────────────────────────────────────
const LANG_KEY = 'tradermind_voice_lang';

export function getStoredVoiceLang(): VoiceLang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'fa-IR' || v === 'en-US') return v as VoiceLang;
  } catch {}
  return 'fa-IR';
}

export function setStoredVoiceLang(lang: VoiceLang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
}

interface UseVoiceInputOptions {
  lang?: VoiceLang;
  /** هنگام شروع ضبط صدا */
  onStart?: () => void;
  /** نتیجه — هم interim (حین صحبت) هم final */
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

function getSR(): (new () => SpeechRecognition) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput({
  lang = 'fa-IR',
  onStart,
  onResult,
  onError,
  onEnd,
}: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && !!getSR());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartedRef = useRef(false);
  const activeLangRef = useRef<VoiceLang>(lang);

  // همیشه به‌روزترین callback
  const onStartRef = useRef(onStart);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onStartRef.current = onStart; }, [onStart]);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  useEffect(() => { activeLangRef.current = lang; }, [lang]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    sessionStartedRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    recognitionRef.current = null;
    setIsListening(false);
    onEndRef.current?.();
  }, []);

  const start = useCallback((overrideLang?: VoiceLang) => {
    const SR = getSR();
    if (!SR) return;

    if (shouldListenRef.current) return;
    shouldListenRef.current = true;
    sessionStartedRef.current = false;
    activeLangRef.current = overrideLang ?? lang;

    const startRecognition = () => {
      if (!shouldListenRef.current) return;
      const rec = new SR();
      rec.lang = activeLangRef.current;
      // Web Speech در حالت non-continuous بعد از اولین مکث متوقف می‌شود.
      // continuous به‌همراه restart کنترل‌شده، تایپ صوتی طولانی را ممکن می‌کند.
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      const emittedFinalResults = new Map<number, string>();

      rec.onstart = () => {
        setIsListening(true);
        if (!sessionStartedRef.current) {
          sessionStartedRef.current = true;
          onStartRef.current?.();
        }
      };

      rec.onresult = (e) => {
        // Process every changed result. Some Electron/Chromium versions
        // resend the same final result, so suppress an identical result index
        // within this recognition instance before it reaches the input.
        for (let index = e.resultIndex; index < e.results.length; index += 1) {
          const result = e.results[index];
          if (!result) continue;
          const transcript = result[0].transcript.trim();
          if (!transcript) continue;
          if (result.isFinal) {
            if (emittedFinalResults.get(index) === transcript) continue;
            emittedFinalResults.set(index, transcript);
          }
          onResultRef.current(transcript, result.isFinal);
        }
      };

      rec.onerror = (e) => {
        const err = (e as SpeechRecognitionErrorEvent).error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          shouldListenRef.current = false;
          setIsListening(false);
          recognitionRef.current = null;
          onErrorRef.current?.(err);
        } else if (err !== 'aborted' && err !== 'no-speech') {
          onErrorRef.current?.(err);
        }
      };

      rec.onend = () => {
        recognitionRef.current = null;
        if (!shouldListenRef.current) {
          setIsListening(false);
          sessionStartedRef.current = false;
          onEndRef.current?.();
          return;
        }
        // بعضی نسخه‌های Chrome/Electron حتی در continuous بعد از مکث کوتاه
        // onend می‌فرستند؛ با تأخیر کم همان نشست را ادامه می‌دهیم.
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          startRecognition();
        }, 120);
      };

      recognitionRef.current = rec;
      try { rec.start(); } catch {
        recognitionRef.current = null;
        if (shouldListenRef.current) {
          restartTimerRef.current = setTimeout(() => {
            restartTimerRef.current = null;
            startRecognition();
          }, 250);
        }
      }
    };

    startRecognition();
  }, [lang]);

  const toggle = useCallback((overrideLang?: VoiceLang) => {
    if (shouldListenRef.current || isListening) stop();
    else start(overrideLang);
  }, [isListening, start, stop]);

  useEffect(() => () => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  return { isListening, isSupported, start, stop, toggle };
}
