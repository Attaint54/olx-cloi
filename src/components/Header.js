import { Suspense } from 'react';
import HeaderClient from './HeaderClient';

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderClient />
    </Suspense>
  );
}