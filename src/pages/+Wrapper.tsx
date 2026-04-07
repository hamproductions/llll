import React, { useEffect, useState } from 'react';
import ErrorBoundary from '~/components/utils/ErrorBoundary';
import { ColorModeProvider } from '~/context/ColorModeContext';
import { ToasterProvider } from '~/context/ToasterContext';

import i18n, { STORAGE_KEY } from '../i18n';
import '../index.css';
import { SentryProvider } from '~/components/utils/SentryContext';

export function Wrapper({ children }: { children: React.ReactNode }) {
  const [, setLangKey] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && i18n.language !== stored) {
      i18n.changeLanguage(stored).then(() => setLangKey((k) => k + 1));
    }
  }, []);

  return (
    <SentryProvider>
      <ErrorBoundary>
        <ColorModeProvider>
          <ToasterProvider>{children}</ToasterProvider>
        </ColorModeProvider>
      </ErrorBoundary>
    </SentryProvider>
  );
}
