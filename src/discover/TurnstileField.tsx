import { useEffect, useRef } from 'react';

type TurnstileWidget = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

let turnstileLoader: Promise<TurnstileWidget> | null = null;

function loadTurnstile(): Promise<TurnstileWidget> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-dp-turnstile]');
    const script = existing ?? document.createElement('script');
    const onLoad = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable'));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
    if (!existing) {
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.dpTurnstile = 'true';
      document.head.appendChild(script);
    }
  });
  return turnstileLoader;
}

export default function TurnstileField({
  siteKey,
  resetSignal,
  onToken,
  onUnavailable,
}: {
  siteKey: string;
  resetSignal: number;
  onToken: (token: string) => void;
  onUnavailable: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onUnavailableRef = useRef(onUnavailable);
  onTokenRef.current = onToken;
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    let disposed = false;
    let widgetId: string | null = null;
    onTokenRef.current('');

    void loadTurnstile().then((turnstile) => {
      if (disposed || !containerRef.current) return;
      widgetId = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: 'website-lead',
        theme: 'dark',
        appearance: 'always',
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => {
          onTokenRef.current('');
          onUnavailableRef.current();
        },
      });
    }).catch(() => {
      if (!disposed) onUnavailableRef.current();
    });

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [resetSignal, siteKey]);

  return (
    <div className="dp-lead__turnstile" aria-label="Spam protection verification">
      <div ref={containerRef} />
    </div>
  );
}
