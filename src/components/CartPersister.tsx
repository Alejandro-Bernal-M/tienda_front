'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCart } from '@/lib/features/cart/cartSlice';

export default function CartPersister() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const isLoaded = useRef(false);

  // 1. CARGAR CARRITO AL INICIAR
  useEffect(() => {
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart && !isLoaded.current) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Solo cargamos si hay items y NO estamos sobrescribiendo un carrito de DB
        if (parsedCart.length > 0) {
            // Aquí despachas una acción para reemplazar los items de Redux
            dispatch(setCart(parsedCart));
        }
      } catch (e) {
        console.error("Error cargando carrito local", e);
      }
    }
    isLoaded.current = true;
  }, [dispatch]);

  // 2. GUARDAR CARRITO CUANDO CAMBIE
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  }, [items]);

  return null; 
}