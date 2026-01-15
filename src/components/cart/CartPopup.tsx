'use client';

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, clearCartDB, hideCart } from "@/lib/features/cart/cartSlice";
import { ShoppingBag, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function CartPopup({ onClose }: { onClose?: () => void }) {
  const t = useTranslations('CartPopup');
  const dispatch = useAppDispatch();
  const popupRef = useRef<HTMLDivElement>(null);
  
  const { token } = useAppSelector((state) => state.user);
  const { products } = useAppSelector((state) => state.products);
  const { items, totalPrices, totalProducts } = useAppSelector((state) => state.cart);

  console.log(products)
  console.log('Cart Items:', items);

  // Asegúrate de que esta variable de entorno esté definida en tu .env.local
  // Ejemplo: NEXT_PUBLIC_IMAGES=http://localhost:4000/public/images/
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  const handleClose = () => {
    if (onClose) onClose();
    else dispatch(hideCart());
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClearCart() {
    if (confirm(t('clearCart') + '?')) {
        if(token) {
          dispatch(clearCartDB(token));
        }
        dispatch(clearCart());
    }
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div 
      ref={popupRef}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white border border-mokaze-primary/10 shadow-2xl rounded-sm overflow-hidden z-50 animate-fade-in origin-top-right"
    >
      
      {/* --- HEADER --- */}
      <div className="p-4 border-b border-mokaze-primary/5 bg-mokaze-base/30 flex justify-between items-center">
        <h2 className="font-serif text-mokaze-primary font-bold text-lg">
            {t('title')} <span className="text-sm font-sans font-normal text-mokaze-dark/50">({totalProducts})</span>
        </h2>
        {onClose && (
            <button onClick={handleClose} className="text-mokaze-dark/40 hover:text-mokaze-accent transition-colors">
                <X className="w-5 h-5" />
            </button>
        )}
      </div>

      {/* --- CONTENT --- */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {items.length > 0 ? (
          <ul className="divide-y divide-mokaze-primary/5">
            {items.map((item) => {
              
              const productInfo = products.find((p) => p._id == item._id);
              
              const mainImage = productInfo?.productImages?.[0]?.img;

              const imageUrl = mainImage?.startsWith('http') 
                ? mainImage 
                : `${imageBaseUrl}${mainImage}`;

              return (
                <li key={item._id + item.size + item.color} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                  {/* Imagen Miniatura */}
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                    {mainImage ? (
                        <Image 
                            src={imageUrl} 
                            alt={productInfo?.name || 'Product'} 
                            fill 
                            sizes="64px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-mokaze-primary line-clamp-1">
                            {productInfo?.name || 'Cargando producto...'}
                        </h3>
                        
                        {/* Variantes: Talla y Color */}
                        {(item.size || item.color) && (
                          <div className="text-xs text-mokaze-dark/60 mt-1 flex flex-wrap gap-x-3">
                            {item.size && (
                              <span className="inline-flex items-center">
                                <span className="font-semibold mr-1">Talla:</span> {item.size}
                              </span>
                            )}
                            {item.size && item.color && <span className="text-gray-300">|</span>}
                            {item.color && (
                              <span className="inline-flex items-center">
                                <span className="font-semibold mr-1">Color:</span> {item.color}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-mokaze-dark/50 mt-1">
                            {item.quantity} x {formatCurrency(item.price)}
                        </p>
                    </div>
                    <p className="text-sm font-bold text-mokaze-accent self-end">
                        {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center text-mokaze-dark/40">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm italic">{t('empty')}</p>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      {items.length > 0 && (
        <div className="p-4 bg-white border-t border-mokaze-primary/5">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest text-mokaze-dark/60">{t('subtotal')}</span>
                <span className="text-xl font-serif font-bold text-mokaze-primary">{formatCurrency(totalPrices)}</span>
            </div>
            
            <div className="space-y-2">
                <Link 
                    href="/cart" 
                    className="block w-full text-center bg-mokaze-primary text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-sm"
                    onClick={handleClose}
                >
                    {t('viewCart')}
                </Link>
                
                <button 
                    onClick={handleClearCart}
                    className="block w-full text-center text-[10px] text-red-400 hover:text-red-600 uppercase tracking-widest font-bold py-2 transition-colors"
                >
                    {t('clearCart')}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}