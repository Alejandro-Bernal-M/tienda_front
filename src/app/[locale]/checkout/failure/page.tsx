'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle, AlertTriangle, ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';

function FailureContent() {
  const t = useTranslations('Checkout.failure');
  const searchParams = useSearchParams();
  
  // Mercado Pago suele enviar estos parámetros
  const status = searchParams.get('collection_status') || searchParams.get('status');
  const paymentType = searchParams.get('payment_type');

  return (
    <div className="bg-white p-8 md:p-12 rounded-sm shadow-xl max-w-lg w-full border border-red-100 text-center relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

        <div className="flex justify-center mb-6 relative z-10">
            <div className="bg-red-50 p-4 rounded-full ring-8 ring-red-50/50">
                <XCircle className="w-16 h-16 text-red-500" />
            </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-mokaze-primary mb-2">
            {t('title')}
        </h1>
        
        <p className="text-mokaze-dark/60 mb-6 leading-relaxed">
            {t('message')}
        </p>

        {/* Detalles técnicos del error (Opcional, pero útil para el usuario) */}
        {(status || paymentType) && (
            <div className="bg-mokaze-base p-4 rounded-sm border border-mokaze-dark/5 mb-8 text-xs text-left">
                <div className="flex items-center gap-2 mb-2 text-mokaze-dark/70 font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" />
                    {t('detailsTitle')}
                </div>
                <div className="grid grid-cols-2 gap-2 text-mokaze-dark/60">
                    {status && (
                        <div>
                            <span className="font-bold">{t('statusLabel')}</span> {status}
                        </div>
                    )}
                    {paymentType && (
                        <div>
                            <span className="font-bold">{t('paymentTypeLabel')}</span> {paymentType}
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="flex flex-col gap-3">
            {/* Botón Principal: Volver al Carrito para reintentar */}
            <Link 
                href="/cart" 
                className="flex items-center justify-center gap-2 w-full bg-mokaze-primary text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all rounded-sm shadow-md hover:shadow-lg"
            >
                <ShoppingBag className="w-4 h-4" />
                {t('retryButton')}
            </Link>

            {/* Botón Secundario: Volver a la tienda */}
            <Link 
                href="/products" 
                className="flex items-center justify-center gap-2 w-full bg-white text-mokaze-dark/50 py-3 uppercase tracking-widest text-xs font-bold hover:text-mokaze-primary border border-transparent hover:border-mokaze-dark/10 transition-all rounded-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                {t('backToStore')}
            </Link>
        </div>
    </div>
  );
}

export default function FailurePage() {
  const t = useTranslations('Checkout.failure');
  return (
    <div className="min-h-screen bg-mokaze-base flex flex-col items-center justify-center p-6 animate-fade-in">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2 text-mokaze-primary/50">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs uppercase tracking-widest">{t('loading')}</span>
        </div>
      }>
        <FailureContent />
      </Suspense>
    </div>
  )
}