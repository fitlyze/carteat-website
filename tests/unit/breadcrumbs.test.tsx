import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Thai Green Curry' },
  ];

  it('renders a labeled nav with links and a current page', () => {
    render(<Breadcrumbs items={items} label="Breadcrumb" />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    const current = screen.getByText('Thai Green Curry');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Breadcrumbs items={items} label="Breadcrumb" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
