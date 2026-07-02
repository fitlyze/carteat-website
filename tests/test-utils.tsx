import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import en from '@/i18n/messages/en.json';

export function IntlWrapper({
  children,
  locale = 'en',
}: {
  children: ReactNode;
  locale?: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={en}>
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(ui: ReactElement, locale = 'en') {
  return render(<IntlWrapper locale={locale}>{ui}</IntlWrapper>);
}
