'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — theme is unknown during SSR and the first client
  // render, so treat as light until mounted. This keeps the label, click target
  // and icons identical to the server output, then updates after mount.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = isDark ? t('switchToLight') : t('switchToDark');

  return (
    <Button
      variant="ghost"
      size="md"
      iconOnly
      aria-label={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span className="relative inline-flex size-5 items-center justify-center">
        <Sun
          aria-hidden
          className="absolute size-5 transition-opacity duration-[--duration-fast] ease-spring data-[hidden=true]:opacity-0"
          data-hidden={isDark}
        />
        <Moon
          aria-hidden
          className="absolute size-5 transition-opacity duration-[--duration-fast] ease-spring data-[hidden=true]:opacity-0"
          data-hidden={!isDark}
        />
      </span>
    </Button>
  );
}
