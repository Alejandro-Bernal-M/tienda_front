'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, clearCartDB, hideCart } from "@/lib/features/cart/cartSlice";
import { ShoppingBag, X } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function CartPopup({ onClose }: { onClose?: () => void }) {
  const t = useTranslations('CartPopup');
  const toastT = useTranslations('Toast');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { token } = useAppSelector((state) => state.user);
  const { products } = useAppSelector((state) => state.products);
  const { items, totalPrices, totalProducts } = useAppSelector((state) => state.cart);

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  const handleClose = () => {
    if (onClose) onClose();
    else dispatch(hideCart());
  };

  const handleGoToCart = () => {
    router.push('/cart');
    handleClose();
  };

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {

      const target = event.target as HTMLElement;

      // Si el click NO está dentro del popup → cerrar
      if (!target.closest('#cart-popup')) {
        handleClose();
      }
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, []); 

  function handleClearCart() {
    const cartClearedMessage = toastT('cartCleared');

    toast.custom(
      (toastObj) => (
        <div className={`${toastObj.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
          <div className="flex-1 w-0 p-1">
            <p className="text-sm font-medium text-gray-900">
              ¿Estás seguro de vaciar el carrito?
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="flex border-l border-gray-200 ml-4">
            <button
              onClick={() => {
                if (token) dispatch(clearCartDB(token));
                dispatch(clearCart());
                toast.dismiss(toastObj.id);
                toast.success(cartClearedMessage);
              }}
              className="w-full p-4 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Sí, vaciar
            </button>

            <button
              onClick={() => toast.dismiss(toastObj.id)}
              className="w-full p-4 text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div
      id="cart-popup"
      className="md:absolute top-full right-0 mt-2 w-full md:w-80 md:w-96 bg-white border border-mokaze-primary/10 shadow-2xl rounded-sm overflow-hidden z-50 animate-fade-in origin-top-right"
    >
      {/* HEADER */}
      <div className="p-4 border-b border-mokaze-primary/5 bg-mokaze-base/30 flex justify-between items-center">
        <h2 className="font-serif text-mokaze-primary font-bold text-lg">
          {t('title')}{" "}
          <span className="text-sm font-sans font-normal text-mokaze-dark/50">
            ({totalProducts})
          </span>
        </h2>
        {onClose && (
          <button onClick={handleClose} className="text-mokaze-dark/40 hover:text-mokaze-accent">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {items.length > 0 ? (
          <ul className="divide-y divide-mokaze-primary/5">
            {items.map((item) => {
              const productInfo = products.find((p) => p._id === item._id);
              const mainImage = productInfo?.productImages?.[0]?.img;
              const imageUrl = mainImage?.startsWith('http')
                ? mainImage
                : `${imageBaseUrl}${mainImage}`;

              return (
                <li key={item._id + item.size + item.color} className="p-4 flex gap-3">
                  <div className="relative w-16 h-16 bg-gray-100 border rounded-sm overflow-hidden">
                    {mainImage ? (
                      <Image src={imageUrl} alt={productInfo?.name || 'Product'} fill className="object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 m-auto text-gray-300" />
                    )}
                  </div>

                  <div className="flex-grow flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{productInfo?.name}</h3>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-bold text-mokaze-accent">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-mokaze-dark/40">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="italic">{t('empty')}</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {items.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="text-xs uppercase">{t('subtotal')}</span>
            <span className="text-xl font-serif font-bold">
              {formatCurrency(totalPrices)}
            </span>
          </div>

          <button
            onClick={handleGoToCart}
            className="w-full bg-mokaze-primary text-white py-3 uppercase text-xs font-bold"
          >
            {t('viewCart')}
          </button>

          <button
            onClick={handleClearCart}
            className="w-full text-[10px] text-red-400 uppercase font-bold py-2"
          >
            {t('clearCart')}
          </button>
        </div>
      )}
    </div>
  );
}
