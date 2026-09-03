import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { IngredientList } from '@/components/recipe/IngredientList';
import { NutritionTable } from '@/components/recipe/NutritionTable';
import { StepList } from '@/components/recipe/StepList';
import type { Ingredient, Nutrition } from '@/schemas/recipe';

import { renderWithIntl } from '../test-utils';

describe('NutritionTable', () => {
  const nutrition: Nutrition = {
    protein: 22,
    carbs: 18,
    fat: 28,
    fiber: 5,
    sugar: 6,
    sodium: 640,
  };

  it('highlights calories and lists macros with units', () => {
    renderWithIntl(<NutritionTable nutrition={nutrition} calories={420} locale="en" />);
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('22 g')).toBeInTheDocument();
    expect(screen.getByText('640 mg')).toBeInTheDocument();
    expect(screen.getByText('Values are estimates.')).toBeInTheDocument();
  });
});

describe('StepList', () => {
  it('renders numbered steps', () => {
    renderWithIntl(<StepList steps={['First step', 'Second step']} />);
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('domain component a11y (jest-axe)', () => {
  const nutrition: Nutrition = {
    protein: 22,
    carbs: 18,
    fat: 28,
    fiber: 5,
    sugar: 6,
    sodium: 640,
  };

  it('NutritionTable has no serious violations', async () => {
    const { container } = renderWithIntl(
      <NutritionTable nutrition={nutrition} calories={420} locale="en" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('IngredientList has no serious violations', async () => {
    const { container } = renderWithIntl(
      <IngredientList
        ingredients={[{ item: 'flour', qty: 200, unit: 'g' }]}
        baseServings={4}
        locale="en"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('IngredientList serving scaler', () => {
  const ingredients: Ingredient[] = [{ item: 'flour', qty: 200, unit: 'g' }];

  it('scales quantities when servings increase', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <IngredientList ingredients={ingredients} baseServings={4} locale="en" />,
    );
    // base: 200
    expect(screen.getByText('200')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Increase servings' }));
    // 5/4 * 200 = 250
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('toggles an ingredient checkbox', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <IngredientList ingredients={ingredients} baseServings={4} locale="en" />,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('does not go below 1 serving', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <IngredientList ingredients={ingredients} baseServings={1} locale="en" />,
    );
    expect(screen.getByRole('button', { name: 'Decrease servings' })).toBeDisabled();
  });
});
