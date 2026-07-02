import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { FeaturedSlider } from '@/components/recipe/FeaturedSlider';
import { RecipeRow } from '@/components/recipe/RecipeRow';
import { selectFeaturedSlides } from '@/lib/content/query';

import { makeRecipe } from '../factories';
import { renderWithIntl } from '../test-utils';

const r = (slug: string, over = {}) => makeRecipe({ slug, ...over });

describe('selectFeaturedSlides', () => {
  it('returns featured recipes first, preserving input order', () => {
    const recipes = [
      r('a', { featured: false }),
      r('b', { featured: true }),
      r('c', { featured: true }),
    ];
    expect(selectFeaturedSlides(recipes).map((s) => s.slug)).toEqual(['b', 'c']);
  });

  it('pads with latest non-featured when fewer than two are featured', () => {
    const recipes = [r('a', { featured: true }), r('b'), r('c')];
    expect(selectFeaturedSlides(recipes).map((s) => s.slug)).toEqual(['a', 'b']);
  });

  it('never duplicates a recipe already taken as featured', () => {
    const recipes = [r('a', { featured: true }), r('b')];
    const slugs = selectFeaturedSlides(recipes).map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('caps the number of slides', () => {
    const recipes = Array.from({ length: 8 }, (_, i) =>
      r(`f${i}`, { featured: true }),
    );
    expect(selectFeaturedSlides(recipes, 5)).toHaveLength(5);
  });

  it('does not mutate the input array', () => {
    const recipes = [r('a', { featured: true }), r('b', { featured: true })];
    const snapshot = [...recipes];
    selectFeaturedSlides(recipes);
    expect(recipes).toEqual(snapshot);
  });

  it('returns an empty array for empty input', () => {
    expect(selectFeaturedSlides([])).toEqual([]);
  });
});

describe('FeaturedSlider', () => {
  const slides = [r('alpha', { title: 'Alpha' }), r('beta', { title: 'Beta' })];

  const activeLabel = (container: HTMLElement) =>
    container
      .querySelector('[aria-roledescription="slide"][aria-hidden="false"]')
      ?.getAttribute('aria-label');

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders nothing when there are no slides', () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('auto-advances to the next slide after 3s', () => {
    vi.useFakeTimers();
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    expect(activeLabel(container)).toBe('1 / 2');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(activeLabel(container)).toBe('2 / 2');
  });

  it('pauses auto-advance while hovered', () => {
    vi.useFakeTimers();
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    fireEvent.mouseEnter(screen.getByRole('region'));
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(activeLabel(container)).toBe('1 / 2');
  });

  it('does not auto-advance under prefers-reduced-motion', () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn() }),
    );
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    act(() => {
      vi.advanceTimersByTime(9000);
    });
    expect(activeLabel(container)).toBe('1 / 2');
  });

  it('jumps to a slide via its dot control', async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    await user.click(screen.getByRole('button', { name: 'Go to slide 2' }));
    expect(activeLabel(container)).toBe('2 / 2');
  });

  it('wraps to the last slide when going previous from the first', async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(activeLabel(container)).toBe('2 / 2');
  });

  it('has no serious a11y violations', async () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('RecipeRow', () => {
  const recipes = [r('one'), r('two')];

  it('renders a "see all" link with the given href and label', () => {
    renderWithIntl(
      <RecipeRow
        title="Latest recipes"
        href="/recipes?sort=newest"
        viewAllLabel="View all Latest recipes"
        recipes={recipes}
        locale="en"
      />,
    );
    const link = screen.getByRole('link', { name: 'View all Latest recipes' });
    expect(link).toHaveAttribute('href', '/recipes?sort=newest');
  });

  it('renders a card per recipe', () => {
    renderWithIntl(
      <RecipeRow
        title="Latest recipes"
        href="/recipes?sort=newest"
        viewAllLabel="View all Latest recipes"
        recipes={recipes}
        locale="en"
      />,
    );
    // each card links to its recipe + the "see all" arrow = 3 links total
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('renders nothing when there are no recipes', () => {
    const { container } = renderWithIntl(
      <RecipeRow
        title="Latest recipes"
        href="/recipes?sort=newest"
        viewAllLabel="View all Latest recipes"
        recipes={[]}
        locale="en"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('has no serious a11y violations', async () => {
    const { container } = renderWithIntl(
      <RecipeRow
        title="Latest recipes"
        href="/recipes?sort=newest"
        viewAllLabel="View all Latest recipes"
        recipes={recipes}
        locale="en"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
