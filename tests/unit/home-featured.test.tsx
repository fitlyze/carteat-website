import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    const recipes = Array.from({ length: 8 }, (_, i) => r(`f${i}`, { featured: true }));
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

  it('renders nothing when there are no slides', () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders every slide reachable, with carousel semantics', () => {
    const { container } = renderWithIntl(<FeaturedSlider slides={slides} />);
    const section = screen.getByRole('region', { name: 'Featured recipes' });
    expect(section).toHaveAttribute('aria-roledescription', 'carousel');
    const items = container.querySelectorAll('[aria-roledescription="slide"]');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('aria-label', '1 / 2');
    expect(items[1]).toHaveAttribute('aria-label', '2 / 2');
    // parallax strip keeps every slide in the tree — nothing hidden
    expect(
      container.querySelector('[aria-roledescription="slide"][aria-hidden="true"]'),
    ).toBeNull();
  });

  it('renders a CTA link per slide', () => {
    renderWithIntl(<FeaturedSlider slides={slides} />);
    const links = screen.getAllByRole('link', { name: 'View recipe' });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('/recipes/alpha'));
    expect(links[1]).toHaveAttribute('href', expect.stringContaining('/recipes/beta'));
  });

  it('renders no dot or arrow controls', () => {
    renderWithIntl(<FeaturedSlider slides={slides} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('exposes a keyboard-focusable track that accepts arrow keys', () => {
    renderWithIntl(<FeaturedSlider slides={slides} />);
    const track = screen.getByRole('group', { name: 'Featured recipes' });
    expect(track).toHaveAttribute('tabindex', '0');
    // jsdom has no layout, so this only asserts the handlers don't throw
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
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
