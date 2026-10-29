'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

const CartSlideOver = dynamic(() => import('./CartSlideOver'), { ssr: false });
const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });

export default function LazyGlobalModals() {
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [loadCart, setLoadCart] = useState(false);
  const [loadSearch, setLoadSearch] = useState(false);

  useEffect(() => {
    if (isCartOpen) setLoadCart(true);
  }, [isCartOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setTimeout(() => {
      fetchCart();
    }, 2500);
    return () => clearTimeout(t);
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    const handleOpen = () => setLoadSearch(true);
    window.addEventListener('open-search-modal', handleOpen);
    return () => window.removeEventListener('open-search-modal', handleOpen);
  }, []);

  return (
    <>
      {loadCart && <CartSlideOver />}
      {loadSearch && <SearchModal defaultOpen />}
    </>
  );
}

