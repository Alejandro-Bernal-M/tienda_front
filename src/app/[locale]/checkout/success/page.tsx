'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearCart, clearCartDB } from '@/lib/features/cart/cartSlice';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
  const t = useTranslations('Checkout.success');
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { token } = useAppSelector((state) => state.user);
  
  // Mercado Pago envía estos params en la URL
  const status = searchParams.get('collection_status') || searchParams.get('status'); // 'approved', 'pending', etc.
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Si el pago fue aprobado, limpiamos el carrito visualmente
    if (status === 'approved') {
      dispatch(clearCart());
      if (token) {
        dispatch(clearCartDB(token));
      }
    }
  }, [status, dispatch, token]);

  if (!status) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-mokaze-dark/50">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-12 rounded-sm shadow-xl max-w-lg w-full border border-mokaze-primary/5 text-center">
        {status === 'approved' ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-mokaze-primary mb-4">
              {t('approvedTitle')}
            </h1>
            <p className="text-mokaze-dark/60 mb-2">
              {t('approvedMessage')}
            </p>
            <p className="text-xs text-mokaze-dark/40">
              {t('transactionId')} <span className="font-mono">{paymentId}</span>
            </p>
          </>
        ) : (
          <>
             <div className="flex justify-center mb-6">
               <div className="bg-red-100 p-4 rounded-full">
                 <XCircle className="w-16 h-16 text-red-600" />
               </div>
             </div>
             <h1 className="text-2xl font-serif font-bold text-red-600 mb-4">
               {t('failedTitle')}
             </h1>
             <p className="text-mokaze-dark/60">
               {t('failedMessage')} <span className="font-bold uppercase">{status}</span>
             </p>
          </>
        )}

        <Link 
            href="/products" 
            className="block w-full bg-mokaze-primary text-white py-4 mt-8 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all rounded-sm shadow-md"
        >
            {t('backToStore')}
        </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-mokaze-base flex flex-col items-center justify-center p-6 animate-fade-in">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-mokaze-primary"/>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}