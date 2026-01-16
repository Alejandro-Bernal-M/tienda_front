'use client';

import { useState, useEffect } from "react";
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
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2, AlertCircle, Truck, MapPin } from "lucide-react";

export default function CartPage() {
  const t = useTranslations('Cart');
  const dispatch = useAppDispatch();
  
  // Redux States
  const { items, totalProducts, totalPrices } = useAppSelector((state) => state.cart);
  const { token, user } = useAppSelector((state) => state.user);
  const { products } = useAppSelector((state) => state.products);

  // Local States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const SHIPPING_COST = 15000; 
  
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Colombia' // Default
  });

  // Pre-llenar datos si el usuario está logueado
  useEffect(() => {
    if (user) {
      setShippingForm(prev => ({
        ...prev,
        name: user.firstName ? `${user.firstName} ${user.lastName}` : prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };
  // ------------------------------------------------

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
  function handleDecrement(item: any) {
    if (item.quantity === 1) {
        handleRemoveItemComplete(item._id);
        return;
    }

    if(item._id){
      const quantityToRemove = 1;
      dispatch(removeItemQuantity({_id: item._id, quantity: quantityToRemove, price: item.price, color: item.color, size: item.size}));
      
      if(token){
        let info = { _id: item._id, quantity: quantityToRemove, price: item.price, size: item.size, color: item.color };
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
  function handleIncrement(item: any, productDetails: any) {
    if (!item._id) return;

    const quantityToAdd = 1;
    let productToAddDB = {
      _id: item._id, 
      quantity: quantityToAdd,
      price: item.price,
      offer: item.offer || 0,
      size: item.size,
      color: item.color,
      name: productDetails?.name,
      description: productDetails?.description,
      category: productDetails?.category,
    };

    if(token) {
      dispatch(addItemToCartDB({ item: productToAddDB, token }));
    }
    
    dispatch(addItem({
      _id: item._id, 
      quantity: quantityToAdd, 
      price: item.price, 
      size: item.size,
      color: item.color,
      product: item.product 
    }));
  }

  // --- MERCADO PAGO CHECKOUT LOGIC ---
  async function handleCheckout() {
    setCheckoutError(null);

    // 1. VALIDACIÓN DE FORMULARIO
    if (!shippingForm.name || !shippingForm.email || !shippingForm.address || !shippingForm.city || !shippingForm.state || !shippingForm.postalCode) {
        setCheckoutError("Por favor completa todos los datos de envío.");
        // Scroll hacia el error (opcional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setIsCheckingOut(true);

    const itemsToSend = items.map((item) => {
        const realProductId = item._id;
        return {
            _id: realProductId, 
            quantity: item.quantity,
            size: item.size,
            color: item.color
        };
    });

    try {
      // 2. PREPARAR BODY CON DATOS DE ENVÍO
      const bodyPayload = {
        items: itemsToSend,
        userId: token ? user?._id : null,
        
        // --- NUEVOS CAMPOS ---
        shippingPrice: SHIPPING_COST,
        contactName: shippingForm.name,
        contactEmail: shippingForm.email,
        deliveryAddress: {
            line1: shippingForm.address,
            city: shippingForm.city,
            state: shippingForm.state,
            country: shippingForm.country,
            postal_code: shippingForm.postalCode
        }
      };

      const response = await fetch(apiEndPoints.createPreference, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || t('alerts.errorCheckout'));
      }
      
      if(result.url){
        window.location.href = result.url;
      } else {
        throw new Error("No redirection URL found");
      }

    } catch (error: any) {
      console.error(error);
      setCheckoutError(error.message || t('alerts.errorCheckout'));
      setIsCheckingOut(false);
    }
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);


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
            
            {/* --- COLUMNA IZQUIERDA (Productos + Envío) --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* LISTA DE PRODUCTOS */}
                <div className="space-y-6">
                    {items.map((item) => {
                        const productDetails = products.find(p => p._id === item._id);
                        const mainImage = productDetails?.productImages?.[0]?.img;
                        
                        const imageUrl = mainImage?.startsWith('http') 
                            ? mainImage 
                            : `${imageBaseUrl}${mainImage}`;

                        return (
                            <div key={item._id + item.size + item.color} className="bg-white p-4 sm:p-6 rounded-sm border border-mokaze-primary/5 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-all hover:shadow-md">
                                
                                {/* Imagen */}
                                <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                                    {mainImage ? (
                                        <Image 
                                            src={imageUrl} 
                                            alt={productDetails?.name || t('productUnavailable')} 
                                            fill 
                                            sizes="(max-width: 768px) 100vw, 33vw"
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
                                        <div>
                                            <h3 className="text-lg font-serif font-bold text-mokaze-primary mb-1">
                                                {productDetails?.name || t('productUnavailable')}
                                            </h3>
                                            
                                            {/* Variantes */}
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 mb-3">
                                                {item.size && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                        Size: {item.size}
                                                    </span>
                                                )}
                                                {item.color && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                        Color: {item.color}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleRemoveItemComplete(item._id)}
                                            className="hidden sm:block text-mokaze-dark/30 hover:text-red-500 transition-colors p-1"
                                            title={t('delete')}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <p className="text-sm text-mokaze-dark/50 mb-4 capitalize hidden sm:block">
                                        {productDetails?.category?.name || t('uncategorized')}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                                        <div className="flex items-center border border-mokaze-dark/20 rounded-sm">
                                            <button 
                                                onClick={() => handleDecrement(item)}
                                                className="px-3 py-2 text-mokaze-dark/60 hover:bg-mokaze-base hover:text-mokaze-accent transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center border-l border-r border-mokaze-dark/20">
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => handleIncrement(item, productDetails)}
                                                className="px-3 py-2 text-mokaze-dark/60 hover:bg-mokaze-base hover:text-mokaze-accent transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-mokaze-dark/40 mb-1 hidden sm:block">
                                                {t('unitPrice')} {formatCurrency(item.price)}
                                            </p>
                                            <p className="text-lg font-bold text-mokaze-primary">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- NUEVO: FORMULARIO DE ENVÍO --- */}
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-mokaze-primary/5 shadow-md">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-mokaze-primary/10">
                        <div className="bg-mokaze-base p-2 rounded-full text-mokaze-primary">
                            <Truck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-mokaze-primary">Información de Envío</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">Nombre Completo</label>
                            <input 
                                type="text" name="name" 
                                value={shippingForm.name} onChange={handleInputChange}
                                placeholder="Juan Pérez"
                                className="w-full border border-gray-200 rounded-sm p-3 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">Correo Electrónico</label>
                            <input 
                                type="email" name="email" 
                                value={shippingForm.email} onChange={handleInputChange}
                                placeholder="juan@ejemplo.com"
                                className="w-full border border-gray-200 rounded-sm p-3 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            />
                        </div>

                        {/* Dirección */}
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">Dirección de Entrega</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" name="address" 
                                    value={shippingForm.address} onChange={handleInputChange}
                                    placeholder="Calle 123 #45-67, Apto 201"
                                    className="w-full border border-gray-200 rounded-sm p-3 pl-10 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                                />
                            </div>
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">Ciudad</label>
                            <input 
                                type="text" name="city" 
                                value={shippingForm.city} onChange={handleInputChange}
                                placeholder="Bogotá"
                                className="w-full border border-gray-200 rounded-sm p-3 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            />
                        </div>

                        {/* Departamento/Estado */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">Departamento</label>
                            <input 
                                type="text" name="state" 
                                value={shippingForm.state} onChange={handleInputChange}
                                placeholder="Cundinamarca"
                                className="w-full border border-gray-200 rounded-sm p-3 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            />
                        </div>

                        {/* Código Postal */}
                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">Código Postal</label>
                            <input 
                                type="text" name="postalCode" 
                                value={shippingForm.postalCode} onChange={handleInputChange}
                                placeholder="110111"
                                className="w-full border border-gray-200 rounded-sm p-3 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            />
                        </div>

                         {/* País (Readonly por ahora si solo vendes en Colombia) */}
                         <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-mokaze-dark/60 tracking-wider">País</label>
                            <input 
                                type="text" name="country" 
                                value={shippingForm.country} readOnly
                                className="w-full border border-gray-200 bg-gray-50 rounded-sm p-3 text-gray-500 text-sm cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="text-left pt-4">
                    <button 
                        onClick={handleClearCart}
                        className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600 border-b border-transparent hover:border-red-600 transition-all pb-0.5"
                    >
                        {t('summary.clear')}
                    </button>
                </div>
            </div>

            {/* --- COLUMNA DERECHA (Resumen) --- */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-mokaze-primary/5 shadow-md sticky top-24">
                    <h2 className="text-xl font-serif font-bold text-mokaze-primary mb-6 border-b border-mokaze-primary/10 pb-4">
                        {t('summary.title')}
                    </h2>

                    {checkoutError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-sm flex items-start gap-2 animate-fade-in">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{checkoutError}</span>
                        </div>
                    )}

                    <div className="space-y-3 text-sm text-mokaze-dark/70 mb-6">
                        <div className="flex justify-between">
                            <span>{t('summary.items')} ({totalProducts})</span>
                            <span className="font-medium">{formatCurrency(totalPrices)}</span>
                        </div>
                        
                        {/* Costo de Envío */}
                        <div className="flex justify-between text-mokaze-accent">
                            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Envío</span>
                            <span className="font-medium">{formatCurrency(SHIPPING_COST)}</span>
                        </div>

                        <div className="border-t border-dashed border-gray-200 my-2"></div>
                    </div>

                    <div className="border-t border-mokaze-primary/10 pt-4 mb-8">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold uppercase tracking-widest text-mokaze-primary">{t('summary.total')}</span>
                            {/* GRAN TOTAL = Productos + Envío */}
                            <span className="text-2xl font-serif font-bold text-mokaze-accent">
                                {formatCurrency(totalPrices + SHIPPING_COST)}
                            </span>
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