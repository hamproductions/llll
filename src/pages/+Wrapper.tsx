import React from 'react';
import ErrorBoundary from '~/components/utils/ErrorBoundary';
import { ColorModeProvider } from '~/context/ColorModeContext';
import { ToasterProvider } from '~/context/ToasterContext';

import '../i18n';
import '../index.css';
import { SentryProvider } from '~/components/utils/SentryContext';

export function Wrapper({ children }: { children: React.ReactNode }) {
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
