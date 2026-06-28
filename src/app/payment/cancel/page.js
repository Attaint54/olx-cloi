'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        <div className="payment-status-icon payment-status-cancel">
          <i className="fa-solid fa-circle-xmark"></i>
        </div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
          If you encountered any issues, please try again.
        </p>
        <div className="payment-status-actions">
          <Link href="/" className="btn btn-primary">
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
