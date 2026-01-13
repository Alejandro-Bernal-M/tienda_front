'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { 
  clearCart, 
  clearCartDB, 
  subtractQuantityFromCartDB, 
  removeItemFromCartDB, 
  removeItem,
  removeItemQuantity,
  addItem,
  addItemToCartDB
} from "@/lib/features/cart/cartSlice";
import apiEndPoints from "@/utils/routes";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function CartPage() {
  const t = useTranslations('Cart');
  const dispatch = useAppDispatch();
  
  // Redux States
  const { items, totalProducts, totalPrices } = useAppSelector((state) => state.cart);
  const { token } = useAppSelector((state) => state.user);
  const { products } = useAppSelector((state) => state.products);

  // Local States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  // --- ACTIONS ---

  function handleClearCart() {
    if (confirm(t('alerts.confirmClear'))) {
        if(token) {
          dispatch(clearCartDB(token));
        }
        dispatch(clearCart());
    }
  }

  // Restar 1 unidad
  function handleDecrement(_id: string) {
    const item = items.find(i => i._id === _id);
    if (item && item.quantity === 1) {
        handleRemoveItemComplete(_id);
        return;
    }

    if(_id){
      const quantityToRemove = 1;
      dispatch(removeItemQuantity({_id: _id, quantity: quantityToRemove}));
      
      if(token){
        let info = { _id: _id, quantity: quantityToRemove };
        dispatch(subtractQuantityFromCartDB({item: info, token: token}));
      }
    }
  }

  // Eliminar ítem completo
  function handleRemoveItemComplete(_id: string) {
    if(_id){
      dispatch(removeItem(_id));
      if(token){
        dispatch(removeItemFromCartDB({productId: _id, token: token}));
      }
    }
  }

  // Sumar 1 unidad
  function handleIncrement(_id: string) {
    const item = products.find(p => p._id === _id);
    if (!item || !item._id) return;

    if(_id){
      const quantityToAdd = 1;
      let product = {
        _id: item._id,
        quantity: quantityToAdd,
        price: item.price,
        offer: item.offer,
      };

      if(token) {
        dispatch(addItemToCartDB({ item: product, token }));
      }
      
      dispatch(addItem({
        _id: _id, 
        quantity: quantityToAdd, 
        name: item.name, 
        price: item.price, 
        description: item.description, 
        category: item.category
      }));
    }
  }

  // Checkout Logic
  async function handleCheckout() {
    setCheckoutError(null);
    setIsCheckingOut(true);

    const productsToCheckout = items.map((item) => ({
        _id: item._id,
        quantity: item.quantity,
    }));

    const data = {
      cartItems: productsToCheckout,
      totalAmount: totalPrices,
    };

    try {
      const response = await fetch(apiEndPoints.checkProductsForCheckout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if(result.checkStatus){
        window.location.href = '/checkout';
      } else {
        setCheckoutError(result.message || t('alerts.errorCheckout'));
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error(error);
      setCheckoutError(t('alerts.errorCheckout'));
      setIsCheckingOut(false);
    }
  }

  // Helper de moneda
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);


  // --- RENDER ---

  if (items.length === 0) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in bg-mokaze-base p-6">
            <div className="bg-white p-12 rounded-full mb-6 shadow-sm">
                <ShoppingBag className="w-16 h-16 text-mokaze-dark/20" />
            </div>
            <h1 className="text-3xl font-serif text-mokaze-primary font-bold mb-2">{t('emptyTitle')}</h1>
            <p className="text-mokaze-dark/50 mb-8">{t('emptySubtitle')}</p>
            <Link 
                href="/products" 
                className="bg-mokaze-primary text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all shadow-lg hover:shadow-xl rounded-sm"
            >
                {t('startShopping')}
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-mokaze-base p-6 md:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl md:text-4xl font-serif text-mokaze-primary font-bold mb-10">
            {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* --- LISTA DE PRODUCTOS (Izquierda) --- */}
            <div className="lg:col-span-2 space-y-6">
                {items.map((item) => {
                    // Encontrar detalles completos del producto
                    const productDetails = products.find(p => p._id === item._id);
                    const mainImage = productDetails?.productImages?.[0]?.img;

                    return (
                        <div key={item._id} className="bg-white p-4 sm:p-6 rounded-sm border border-mokaze-primary/5 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-all hover:shadow-md">
                            
                            {/* Imagen */}
                            <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                {mainImage ? (
                                    <Image 
                                        src={`${imageBaseUrl}${mainImage}`} 
                                        alt={productDetails?.name || t('productUnavailable')} 
                                        fill 
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow text-center sm:text-left w-full">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-serif font-bold text-mokaze-primary mb-1">
                                        {productDetails?.name || t('productUnavailable')}
                                    </h3>
                                    {/* Botón Borrar (Desktop) */}
                                    <button 
                                        onClick={() => handleRemoveItemComplete(item._id)}
                                        className="hidden sm:block text-mokaze-dark/30 hover:text-red-500 transition-colors p-1"
                                        title={t('delete')}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <p className="text-sm text-mokaze-dark/50 mb-4 capitalize">
                                    {productDetails?.category?.name || t('uncategorized')}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                                    
                                    {/* Control Cantidad */}
                                    <div className="flex items-center border border-mokaze-dark/20 rounded-sm">
                                        <button 
                                            onClick={() => handleDecrement(item._id)}
                                            className="px-3 py-2 text-mokaze-dark/60 hover:bg-mokaze-base hover:text-mokaze-accent transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center border-l border-r border-mokaze-dark/20">
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => handleIncrement(item._id)}
                                            className="px-3 py-2 text-mokaze-dark/60 hover:bg-mokaze-base hover:text-mokaze-accent transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Precio */}
                                    <div className="text-right">
                                        <p className="text-xs text-mokaze-dark/40 mb-1">
                                            {t('unitPrice')} {formatCurrency(item.price)}
                                        </p>
                                        <p className="text-lg font-bold text-mokaze-primary">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>

                                {/* Botón Borrar (Móvil) */}
                                <button 
                                    onClick={() => handleRemoveItemComplete(item._id)}
                                    className="sm:hidden mt-4 text-xs text-red-500 flex items-center justify-center gap-1 w-full py-2 border border-red-100 bg-red-50 rounded-sm"
                                >
                                    <Trash2 className="w-3 h-3" /> {t('delete')}
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {/* Botón Vaciar Carrito */}
                <div className="text-left pt-4">
                    <button 
                        onClick={handleClearCart}
                        className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600 border-b border-transparent hover:border-red-600 transition-all pb-0.5"
                    >
                        {t('summary.clear')}
                    </button>
                </div>
            </div>


            {/* --- RESUMEN DE ORDEN (Derecha) --- */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-mokaze-primary/5 shadow-md sticky top-24">
                    <h2 className="text-xl font-serif font-bold text-mokaze-primary mb-6 border-b border-mokaze-primary/10 pb-4">
                        {t('summary.title')}
                    </h2>

                    {checkoutError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{checkoutError}</span>
                        </div>
                    )}

                    <div className="space-y-3 text-sm text-mokaze-dark/70 mb-6">
                        <div className="flex justify-between">
                            <span>{t('summary.items')} ({totalProducts})</span>
                            <span className="font-medium">{formatCurrency(totalPrices)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('summary.subtotal')}</span>
                            <span className="font-medium">{formatCurrency(totalPrices)}</span>
                        </div>
                    </div>

                    <div className="border-t border-mokaze-primary/10 pt-4 mb-8">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold uppercase tracking-widest text-mokaze-primary">{t('summary.total')}</span>
                            <span className="text-2xl font-serif font-bold text-mokaze-accent">{formatCurrency(totalPrices)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full bg-mokaze-primary text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
                    >
                        {isCheckingOut ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('summary.checking')}
                            </>
                        ) : (
                            <>
                                {t('summary.checkout')}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                    
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-mokaze-dark/40">
                            {t('summary.disclaimer')}
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}