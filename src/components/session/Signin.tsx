'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation'; // Router compatible con idiomas
import apiEndPoints from "@/utils/routes";
import { useAppDispatch } from "@/lib/hooks";
import { signIn } from "@/lib/features/user/userSlice";
import { getCartItemsDB } from "@/lib/features/cart/cartSlice";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react"; // Iconos
import { syncGuestCartWithDB } from '@/lib/features/cart/cartSlice';
import { useAppSelector } from '@/lib/hooks';

export default function Signin() {
  const t = useTranslations('Session.signin');
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Estados locales para manejo de UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { items } = useAppSelector((state) => state.cart);

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    const body = { email, password };

    try {
      const res = await fetch(apiEndPoints.signin, {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        
        // 1. Actualizar Redux User
        dispatch(signIn(data));
        
        // 2. Persistencia en LocalStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // 3. Sincronizar Carrito de base de datos
        dispatch(syncGuestCartWithDB({ cartItems: items, token: data.token }));
        
        // 4. Redirigir a productos
        router.push('/products');
      } else {
        // Manejo de error del servidor (400, 401, etc.)
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.message || t('errorCredentials'));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }

  // Estilos reutilizables
  const inputClass = "w-full bg-transparent border-b border-mokaze-dark/20 py-3 text-mokaze-primary placeholder-mokaze-dark/40 focus:outline-none focus:border-mokaze-accent transition-colors duration-300";

  return (
    <div className="animate-fade-in w-full">
      
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-mokaze-primary font-bold mb-2">
          {t('title')}
        </h1>
        <p className="text-mokaze-dark/60 text-xs tracking-wider uppercase">
          {t('subtitle')}
        </p>
      </div>

      {/* Mensaje de Error Visual */}
      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-sm flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario */}
      <form className="space-y-6" onSubmit={handleSignin}>
        
        <div className="group">
          <input 
            className={inputClass} 
            name="email" 
            type="email" 
            placeholder={t('emailPlaceholder')} 
            required
            disabled={isLoading}
          />
        </div>

        <div className="group">
          <input 
            className={inputClass} 
            name="password" 
            type="password" 
            placeholder={t('passwordPlaceholder')} 
            required
            disabled={isLoading}
          />
        </div>

        <button 
          className="w-full bg-mokaze-primary text-white py-4 mt-6 tracking-widest uppercase text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('loading')}
            </>
          ) : (
            <>
              {t('submit')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
      
    </div>
  );
}