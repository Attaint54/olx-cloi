'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { OLX_API } from '../../../services/api';

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found.');
      setLoading(false);
      return;
    }

    async function fetchPayment() {
      try {
        const data = await OLX_API.getPaymentBySessionId(sessionId);
        setPayment(data);
      } catch (err) {
        setError(err.message || 'Failed to load payment details.');
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchPayment, 1000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="payment-status-page">
        <div className="payment-status-card">
          <div className="payment-status-icon payment-status-pending">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
          <h1>Verifying Payment...</h1>
          <p>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-status-page">
        <div className="payment-status-card">
          <div className="payment-status-icon payment-status-error">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
          <h1>Something went wrong</h1>
          <p>{error}</p>
          <div className="payment-status-actions">
            <Link href="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        <div className="payment-status-icon payment-status-success">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h1>Payment Successful!</h1>
        <p>Your order has been confirmed. Thank you for your purchase.</p>

        {payment && (
          <div className="payment-details-box">
            <div className="payment-detail-row">
              <span className="payment-detail-label">Amount Paid</span>
              <span className="payment-detail-value">${Number(payment.amount).toLocaleString()}</span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Status</span>
              <span className="payment-detail-value payment-status-badge success">Completed</span>
            </div>
            {payment.product && (
              <div className="payment-detail-row">
                <span className="payment-detail-label">Product</span>
                <span className="payment-detail-value">{payment.product.title || 'N/A'}</span>
              </div>
            )}
            <div className="payment-detail-row">
              <span className="payment-detail-label">Date</span>
              <span className="payment-detail-value">
                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        )}

        <div className="payment-status-actions">
          <Link href="/payment/history" className="btn btn-primary">
            <i className="fa-solid fa-receipt"></i> View Orders
          </Link>
          <Link href="/" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
