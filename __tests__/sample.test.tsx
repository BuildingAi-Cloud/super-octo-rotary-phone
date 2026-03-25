import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Sample Test', () => {
  it('renders a simple message', () => {
    render(<div>Hello, test!</div>);
    expect(screen.getByText('Hello, test!')).toBeInTheDocument();
  });
});
