import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { FieldHint, Input, Label } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

describe('Button', () => {
  it('renders an accessible button with its label', () => {
    render(<Button>Save recipe</Button>);
    expect(screen.getByRole('button', { name: 'Save recipe' })).toBeInTheDocument();
  });

  it('is disabled and busy while loading', () => {
    render(<Button loading>Submit</Button>);
    const btn = screen.getByRole('button', { name: 'Submit' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('applies variant + size classes', () => {
    render(
      <Button variant="accent" size="lg">
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.className).toContain('bg-accent');
    expect(btn.className).toContain('h-13');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Button>Accessible</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Card', () => {
  it('renders children and supports hover lift', async () => {
    const { container } = render(<Card hoverable>Body</Card>);
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-surface');
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Badge', () => {
  it('renders tonal variant', () => {
    render(<Badge variant="tonal">Vegan</Badge>);
    expect(screen.getByText('Vegan').className).toContain('bg-primary-subtle');
  });
});

describe('Chip', () => {
  it('renders a toggle chip with aria-pressed', () => {
    render(<Chip selected>Thai</Chip>);
    expect(screen.getByRole('button', { name: 'Thai' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders a removable chip with an accessible remove button', async () => {
    const { container } = render(
      <Chip onRemove={() => {}} removeLabel="Remove Thai filter">
        Thai
      </Chip>,
    );
    expect(
      screen.getByRole('button', { name: 'Remove Thai filter' }),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Input + Label', () => {
  it('associates label and has no axe violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
        <FieldHint error>Required</FieldHint>
      </div>,
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Skeleton', () => {
  it('is decorative (aria-hidden) with shimmer class', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden');
    expect(el.className).toContain('skeleton');
  });
});

describe('Tabs', () => {
  it('renders tabs with the default panel visible', async () => {
    const { container } = render(
      <Tabs defaultValue="ingredients">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
        </TabsList>
        <TabsContent value="ingredients">Ingredient list</TabsContent>
        <TabsContent value="steps">Step list</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Ingredients' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Ingredient list')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
