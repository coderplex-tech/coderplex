import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypewriterText({ 
  phrases, 
  typingSpeed = 100, 
  deletingSpeed = 50,
  pauseDuration = 2000 
}: TypewriterTextProps) {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    const timer = setTimeout(() => {
      if (isWaiting) {
        setIsWaiting(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        setText(prev => prev.slice(0, -1));
        if (text === '') {
          setIsDeleting(false);
          setPhraseIndex(prev => (prev + 1) % phrases.length);
        }
      } else {
        setText(currentPhrase.slice(0, text.length + 1));
        if (text === currentPhrase) {
          setIsWaiting(true);
        }
      }
    }, isWaiting ? pauseDuration : isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [text, phraseIndex, isDeleting, isWaiting, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="font-mono">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
} 