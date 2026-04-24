import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CouponInput } from './CouponInput';
import * as couponServiceModule from '../services/coupon.service';

vi.mock('../services/coupon.service', () => ({
  couponService: {
    applyCoupon: vi.fn(),
  },
}));

describe('CouponInput', () => {
  const mockOnCouponApplied = vi.fn();
  const mockOnCouponRemoved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and Apply button', () => {
    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={null}
      />,
    );

    expect(screen.getByPlaceholderText('Enter coupon code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();
  });

  it('calls onCouponApplied with correct data when valid coupon applied', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      couponCode: 'SAVE10',
      discount: 100000,
      finalAmount: 900000,
      type: 'percent' as const,
      value: 10,
    };

    vi.mocked(couponServiceModule.couponService.applyCoupon).mockResolvedValueOnce(mockResponse);

    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={null}
      />,
    );

    await user.type(screen.getByPlaceholderText('Enter coupon code'), 'save10');
    await user.click(screen.getByRole('button', { name: /Apply/i }));

    await waitFor(() => {
      expect(mockOnCouponApplied).toHaveBeenCalledWith({
        code: 'SAVE10',
        discount: 100000,
        type: 'percent',
        value: 10,
      });
    });
  });

  it('shows error message when service throws', async () => {
    const user = userEvent.setup();
    vi.mocked(couponServiceModule.couponService.applyCoupon).mockRejectedValueOnce(
      new Error('Coupon not found'),
    );

    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={null}
      />,
    );

    await user.type(screen.getByPlaceholderText('Enter coupon code'), 'invalid');
    await user.click(screen.getByRole('button', { name: /Apply/i }));

    await waitFor(() => {
      expect(screen.getByText('Coupon not found')).toBeInTheDocument();
    });
  });

  it('disables button while applying', async () => {
    const user = userEvent.setup();
    vi.mocked(couponServiceModule.couponService.applyCoupon).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                couponCode: 'SAVE10',
                discount: 100000,
                finalAmount: 900000,
                type: 'percent',
                value: 10,
              }),
            500,
          ),
        ),
    );

    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={null}
      />,
    );

    await user.type(screen.getByPlaceholderText('Enter coupon code'), 'save10');
    await user.click(screen.getByRole('button', { name: /Apply/i }));

    expect(screen.getByRole('button', { name: /Apply/i })).toBeDisabled();
  });

  it('renders applied coupon with remove button', () => {
    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={{ code: 'SAVE10', discount: 100000, type: 'percent', value: 10 }}
      />,
    );

    expect(screen.getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText('10% off')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove coupon')).toBeInTheDocument();
  });

  it('calls onCouponRemoved when X button clicked', async () => {
    const user = userEvent.setup();

    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={{ code: 'SAVE10', discount: 100000, type: 'percent', value: 10 }}
      />,
    );

    await user.click(screen.getByLabelText('Remove coupon'));
    expect(mockOnCouponRemoved).toHaveBeenCalled();
  });

  it('applies coupon on Enter key press', async () => {
    const user = userEvent.setup();
    vi.mocked(couponServiceModule.couponService.applyCoupon).mockResolvedValueOnce({
      couponCode: 'SAVE10',
      discount: 100000,
      finalAmount: 900000,
      type: 'percent',
      value: 10,
    });

    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={null}
      />,
    );

    await user.type(screen.getByPlaceholderText('Enter coupon code'), 'save10');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnCouponApplied).toHaveBeenCalledWith({
        code: 'SAVE10',
        discount: 100000,
        type: 'percent',
        value: 10,
      });
    });
  });

  it('shows fixed discount amount when coupon type is fixed', () => {
    render(
      <CouponInput
        subtotal={1000000}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={{ code: 'SAVE50K', discount: 50000, type: 'fixed', value: 50000 }}
      />,
    );

    expect(screen.getByText(/-50,000₫|-50000₫/)).toBeInTheDocument();
  });
});
