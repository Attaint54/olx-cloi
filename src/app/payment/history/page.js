'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OLX_API } from '../../../services/api';
import { getSavedSession } from '../../../services/auth';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const session = getSavedSession();
    if (!session) {
      setError('Please log in to view your orders.');
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      try {
        const data = await OLX_API.getPaymentHistory();
        setPayments(data.payments || []);
      } catch (err) {
        setError(err.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="payment-history-page">
        <h1>My Orders</h1>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary-brand)' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-page">
        <h1>My Orders</h1>
        <div className="payment-empty-state">
          <i className="fa-solid fa-lock"></i>
          <h3>Authentication Required</h3>
          <p>{error}</p>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-page">
      <h1>My Orders</h1>

      {payments.length === 0 ? (
        <div className="payment-empty-state">
          <i className="fa-solid fa-receipt"></i>
          <h3>No orders yet</h3>
          <p>You haven't made any purchases yet. Start exploring products!</p>
          <Link href="/" className="btn btn-primary">
            <i className="fa-solid fa-shop"></i> Browse Products
          </Link>
        </div>
      ) : (
        <div className="payment-history-list">
          {payments.map((p) => (
            <div key={p.id} className="payment-history-card">
              <div className="payment-history-header">
                <span className="payment-history-id">Order #{p.id?.slice(-8) || 'N/A'}</span>
                <span className={`payment-status-badge ${p.paymentStatus}`}>
                  {p.paymentStatus}
                </span>
              </div>

              <div className="payment-history-body">
                {p.product && (
                  <div className="payment-history-product">
                    {p.product.thumbnail && (
                      <img src={p.product.thumbnail} alt={p.product.title} className="payment-history-thumb" />
                    )}
                    <div className="payment-history-product-info">
                      <strong>{p.product.title || 'Unknown Product'}</strong>
                      <span className="payment-history-date">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="payment-history-amount">
                  <span className="payment-history-label">Amount</span>
                  <strong>${Number(p.amount).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
