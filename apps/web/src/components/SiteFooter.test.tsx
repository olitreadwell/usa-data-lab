import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from './SiteFooter';

expect.extend(toHaveNoViolations);

describe('SiteFooter', () => {
  it('renders the mission line', () => {
    render(<SiteFooter />);
    expect(screen.getByText(/small experiments in US public data/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SiteFooter />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
