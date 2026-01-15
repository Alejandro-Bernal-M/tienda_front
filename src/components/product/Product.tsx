'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addItem, addItemToCartDB } from '@/lib/features/cart/cartSlice';
import type { ProductType } from '@/lib/types';
import { ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, PackageOpen } from 'lucide-react';

export default function Product(product: ProductType) {
  const t = useTranslations('ProductCard');
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { token } = useAppSelector((state) => state.user);

  const [currentImage, setCurrentImage] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [buttonText, setButtonText] = useState(t('addToCart'));

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';
  const hasMultipleImages = product.productImages && product.productImages.length > 1;
  const isOutOfStock = product.quantity === 0;

  const hasOffer = (product.offer || 0) > 0;
  
  const finalPrice = hasOffer
    ? product.price - (product.price * (product.offer || 0) / 100) 
    : product.price;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  function handleQuantityChange(delta: number) {
    const newQty = productQuantity + delta;
    if (newQty >= 1 && newQty <= product.quantity) {
      setProductQuantity(newQty);
    }
  }

  function handleImageNav(direction: 'next' | 'prev', e: React.MouseEvent) {
    e.stopPropagation();
    if (!product.productImages) return;

    if (direction === 'next') {
      setCurrentImage((prev) => (prev + 1) % product.productImages!.length);
    } else {
      setCurrentImage((prev) => (prev - 1 + product.productImages!.length) % product.productImages!.length);
    }
  }

  function handleAddToCart() {
    if (isOutOfStock) return;
    if (!selectedSize || !selectedColor) {
      alert(t('selectSizeColor'));
      return;
    }
    
    if (!product._id) {
      alert('Product ID is missing');
      return;
    }
    
    setIsAdding(true);
    setButtonText(t('adding'));

    
    
    if (product._id && token) {
      const item = {
        _id: product._id,
        quantity: productQuantity,
        price: finalPrice,
        size: selectedSize,
        color: selectedColor,
        offer: product.offer,
      };
      dispatch(addItem(item));
      dispatch(addItemToCartDB({ item, token }));
    }

    setTimeout(() => {
      setButtonText(t('added'));
      setIsAdding(false);
      setTimeout(() => {
        setButtonText(t('addToCart'));
        setProductQuantity(1);
      }, 2000);
    }, 600);
  }

  return (
    <div className="group bg-white rounded-sm border border-mokaze-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full relative animate-fade-in-up">
      
      {/* Corrección 2: Renderizado condicional estricto del Badge */}
      {hasOffer && (
        <div className="absolute top-0 right-0 z-10 bg-mokaze-accent text-white text-xs font-bold px-3 py-1.5 shadow-sm">
          {product.offer}% {t('offer')}
        </div>
      )}

      {/* --- CARRUSEL DE IMÁGENES --- */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {product.productImages && product.productImages.length > 0 ? (
          <>
            <Image 
              src={`${imageBaseUrl}${product.productImages[currentImage].img}`} 
              alt={product.name} 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {hasMultipleImages && (
              <div className="absolute inset-0 flex justify-between items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => handleImageNav('prev', e)}
                  className="p-1 bg-white/80 hover:bg-white text-mokaze-primary rounded-full shadow-md transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleImageNav('next', e)}
                  className="p-1 bg-white/80 hover:bg-white text-mokaze-primary rounded-full shadow-md transition-all backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
            <PackageOpen className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* --- CONTENIDO --- */}
      <div className="p-5 flex flex-col flex-grow">
        
        {pathname === '/admin/products' && (
          <div className="mb-3 p-2 bg-gray-50 text-[10px] text-mokaze-dark/60 rounded-sm border border-gray-100">
             <p><span className="font-bold">{t('category')}</span> {product.category?.name}</p>
             <p><span className="font-bold">{t('createdBy')}</span> {product.createdBy?.firstName}</p>
          </div>
        )}

        <div className="mb-2">
            <p className="text-xs uppercase tracking-widest text-mokaze-dark/40 mb-1 truncate">
                {product.category?.name || 'General'}
            </p>
            <h3 className="font-serif text-lg font-bold text-mokaze-primary leading-tight line-clamp-2 min-h-[3rem]">
                {product.name}
            </h3>
        </div>

        <p className="text-sm text-mokaze-dark/60 line-clamp-2 mb-4 flex-grow">
            {product.description}
        </p>

        {/* SELECTORES DE TALLA Y COLOR */}
        <div className="flex gap-4 mb-4">
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label htmlFor="size" className="block text-xs font-bold text-mokaze-dark/60 mb-1">
                {t('sizes')}
              </label>
              <select
                id="size"
                value={selectedSize || ''}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="border border-mokaze-dark/20 rounded-sm p-2 text-sm w-full bg-transparent text-mokaze-primary focus:outline-none focus:border-mokaze-accent transition-colors duration-300"
              >
                <option value="" disabled>{t('selectSize')}</option>
                {product.sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div>
              <label htmlFor="color" className="block text-xs font-bold text-mokaze-dark/60 mb-1">
                {t('colors')}
              </label>
              <select
                id="color"
                value={selectedColor || ''}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="border border-mokaze-dark/20 rounded-sm p-2 text-sm w-full bg-transparent text-mokaze-primary focus:outline-none focus:border-mokaze-accent transition-colors duration-300"
              >
                <option value="" disabled>{t('selectColor')}</option>
                {product.colors.map((color) => (
                  <option className="uppercase" key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* PRECIO */}
        <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-serif font-bold text-mokaze-primary">
                {formatCurrency(finalPrice)}
            </span>
            
            {/* Corrección 3: Renderizado condicional estricto del precio tachado */}
            {hasOffer && (
                <span className="text-sm text-mokaze-dark/40 line-through decoration-red-400">
                    {formatCurrency(product.price)}
                </span>
            )}
        </div>

        {/* --- CONTROLES --- */}
        <div className="mt-auto space-y-3">
            
            {!isOutOfStock ? (
                <div className="flex gap-3">
                    <div className="flex items-center border border-mokaze-primary/10 rounded-sm h-10 w-24">
                        <button 
                            onClick={() => handleQuantityChange(-1)}
                            className="w-8 h-full flex items-center justify-center text-mokaze-dark/50 hover:bg-gray-50 hover:text-mokaze-primary transition-colors disabled:opacity-30"
                            disabled={productQuantity <= 1}
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="flex-grow text-center text-sm font-bold text-mokaze-primary">
                            {productQuantity}
                        </span>
                        <button 
                            onClick={() => handleQuantityChange(1)}
                            className="w-8 h-full flex items-center justify-center text-mokaze-dark/50 hover:bg-gray-50 hover:text-mokaze-primary transition-colors disabled:opacity-30"
                            disabled={productQuantity >= product.quantity}
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className={`flex-grow flex items-center justify-center gap-2 h-10 px-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md rounded-sm ${
                            buttonText === t('added') 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-mokaze-primary text-white hover:bg-mokaze-accent'
                        }`}
                    >
                        {buttonText === t('addToCart') && <ShoppingCart className="w-4 h-4" />}
                        {buttonText}
                    </button>
                </div>
            ) : (
                <div className="w-full h-10 bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold uppercase tracking-widest rounded-sm cursor-not-allowed">
                    {t('outOfStock')}
                </div>
            )}
            
            {!isOutOfStock && (
                <p className="text-[10px] text-center text-mokaze-dark/30">
                    {product.quantity} {t('available')}
                </p>
            )}
        </div>

      </div>
    </div>
  );
}