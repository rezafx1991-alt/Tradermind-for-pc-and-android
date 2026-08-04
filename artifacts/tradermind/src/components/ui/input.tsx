import * as React from 'react';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceMicButton } from '@/components/ui/voice-mic-button';
import { getStoredVoiceLang } from '@/hooks/useVoiceInput';
import type { VoiceLang } from '@/hooks/useVoiceInput';
import { appendVoiceTranscript } from '@/lib/voice-transcript';

// این انواع input تایپ صوتی ندارند
const SKIP_VOICE_TYPES = new Set([
  'number', 'password', 'email', 'hidden', 'file',
  'date', 'time', 'datetime-local', 'month', 'week',
  'color', 'range', 'checkbox', 'radio',
  'submit', 'button', 'reset', 'image',
]);

export interface InputProps extends React.ComponentProps<'input'> {
  disableVoice?: boolean;
  /** میکروفون برای inputهای کوتاه عمداً opt-in است. */
  voice?: boolean;
}

// تنظیم مقدار input از طریق native setter تا React (و react-hook-form) onChange فعال شود
function setInputValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disableVoice, voice = false, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const [activeLang, setActiveLang] = React.useState<VoiceLang>(getStoredVoiceLang);

    const mergedRef = React.useCallback(
      (el: HTMLInputElement | null) => {
        (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      },
      [ref],
    );

    const savedValueRef = React.useRef('');
    const finalTextRef = React.useRef('');
    const interimTextRef = React.useRef('');

    const handleVoiceStart = React.useCallback(() => {
      savedValueRef.current = innerRef.current?.value ?? '';
      finalTextRef.current = '';
      interimTextRef.current = '';
    }, []);

    // نتایج نهایی جمع می‌شوند و نتیجه موقت فقط پیش‌نمایش است؛ بنابراین
    // مکث‌ها باعث پاک شدن یا تکرار متن قبلی نمی‌شوند.
    const handleVoiceResult = React.useCallback((text: string, isFinal: boolean) => {
      const el = innerRef.current;
      if (!el) return;
      if (isFinal) {
        finalTextRef.current = appendVoiceTranscript(finalTextRef.current, text);
        interimTextRef.current = '';
      } else {
        interimTextRef.current = text;
      }
      const spoken = `${finalTextRef.current} ${interimTextRef.current}`.trim();
      setInputValue(el, spoken || savedValueRef.current);
    }, []);

    const { isListening, isSupported, toggle } = useVoiceInput({
      lang: activeLang,
      onStart: handleVoiceStart,
      onResult: handleVoiceResult,
    });

    const handleToggle = React.useCallback((lang: VoiceLang) => {
      setActiveLang(lang);
      toggle(lang);
    }, [toggle]);

    const showVoice = voice && !disableVoice && !SKIP_VOICE_TYPES.has(type ?? 'text');

    // بدون دکمه صوتی برای انواع خاص
    if (!showVoice) {
      return (
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          )}
          ref={mergedRef}
          {...props}
        />
      );
    }

    // همیشه wrapper + میکروفون نمایش داده می‌شود (حتی اگر isSupported=false)
    return (
      <div className="relative flex w-full items-center">
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            // فضای راست برای دکمه میکروفون
            'pr-11',
            // حاشیه رنگی هنگام گوش دادن
            isListening && 'ring-1 ring-red-500 border-red-500/60',
            className,
          )}
          ref={mergedRef}
          {...props}
        />
        <VoiceMicButton
          isListening={isListening}
          isSupported={isSupported}
          onToggle={handleToggle}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10"
          size="sm"
        />
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };
