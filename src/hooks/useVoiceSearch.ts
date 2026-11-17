import { useState, useRef, useEffect, useCallback } from 'react';
import { LanguageCode } from '../utils/translations';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const SPEECH_LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  hinglish: 'en-IN',
};

function getSpeechCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useVoiceSearch(
  lang: LanguageCode = 'en',
  onTranscript: (text: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const isSupported = Boolean(getSpeechCtor());

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setVoiceError(null);
    const Ctor = getSpeechCtor();
    if (!Ctor) {
      setVoiceError('Voice search is not supported in this browser.');
      return;
    }

    try {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
      }

      const recognition = new Ctor();
      recognition.lang = SPEECH_LOCALE_MAP[lang] || 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
        if (transcript) {
          onTranscriptRef.current(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission denied.');
        } else if (event.error && event.error !== 'aborted' && event.error !== 'no-speech') {
          setVoiceError('Could not recognize speech. Please try again.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch {
      setVoiceError('Unable to start microphone.');
      setIsListening(false);
    }
  }, [isListening, lang]);

  return {
    isSupported,
    isListening,
    voiceError,
    startListening,
    stopListening,
  };
}
