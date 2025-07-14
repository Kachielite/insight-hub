import { render, screen } from '@testing-library/react';

import AgreementLink from '@/features/Authentication/presentation/components/agreement-link';

describe('AgreementLink', () => {
  it('should render the agreement text correctly', () => {
    render(<AgreementLink />);

    const container = screen.getByText((_content, element) => {
      const hasText = (node: Element | null) =>
        node?.textContent ===
        'By clicking continue, you agree to our Terms of Service and Privacy Policy.';
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child as Element)
      );
      return elementHasText && childrenDontHaveText;
    });

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should render Terms of Service link with correct attributes', () => {
    render(<AgreementLink />);

    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.tagName).toBe('A');
    expect(termsLink).toHaveAttribute('href', '#');
  });

  it('should render Privacy Policy link with correct attributes', () => {
    render(<AgreementLink />);

    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.tagName).toBe('A');
    expect(privacyLink).toHaveAttribute('href', '#');
  });

  it('should have correct CSS classes applied', () => {
    const { container } = render(<AgreementLink />);

    const agreementDiv = container.firstChild as HTMLElement;
    expect(agreementDiv).toHaveClass('text-muted-foreground');
    expect(agreementDiv).toHaveClass('text-center');
    expect(agreementDiv).toHaveClass('text-xs');
    expect(agreementDiv).toHaveClass('text-balance');
  });

  it('should match snapshot', () => {
    const { container } = render(<AgreementLink />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
