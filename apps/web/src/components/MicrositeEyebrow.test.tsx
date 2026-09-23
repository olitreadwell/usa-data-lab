import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MicrositeEyebrow } from './MicrositeEyebrow';

describe('MicrositeEyebrow', () => {
  it('announces the label text and hides the decorative emoji', () => {
    const { container } = render(<MicrositeEyebrow eyebrow="📉 the jobless rate" className="" />);
    expect(screen.getByText('the jobless rate')).toBeInTheDocument();
    const hiddenEmoji = container.querySelector('[aria-hidden="true"]');
    expect(hiddenEmoji).not.toBeNull();
    expect(hiddenEmoji?.textContent).toContain('📉');
  });

  it('hides a multi-code-point emoji and announces the label', () => {
    const { container } = render(<MicrositeEyebrow eyebrow="🏞️ the river lengths" className="" />);
    expect(screen.getByText('the river lengths')).toBeInTheDocument();
    const hiddenEmoji = container.querySelector('[aria-hidden="true"]');
    expect(hiddenEmoji?.textContent).toContain('🏞️');
  });

  it('keeps a label with no leading emoji fully announced', () => {
    const { container } = render(<MicrositeEyebrow eyebrow="the jobless rate" className="" />);
    expect(screen.getByText('the jobless rate')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
