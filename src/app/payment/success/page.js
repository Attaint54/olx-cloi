import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="payment-status-page"><div className="payment-status-card"><p>Loading...</p></div></div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
