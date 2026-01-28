'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import apiEndPoints from '@/utils/routes';
import { updateOrder } from "@/lib/features/orders/ordersSlice";
import toast from 'react-hot-toast';
import { 
  ArrowLeft, User, MapPin, CreditCard, Truck, Calendar, 
  Package, Save, Loader2, AlertCircle
} from 'lucide-react';

// Importamos tus tipos base
import type { Order, ProductType } from '@/lib/types';


// --- TIPOS EXTENDIDOS PARA LA VISTA (Populated) ---
interface PopulatedOrderProduct {
  product: String; 
  quantity: number;
  size?: string;  
  color?: string;
  _id?: string;
}

interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Extendemos tu Order base pero sobrescribimos user y products
interface AdminOrderDetail extends Omit<Order, 'user' | 'products' | 'orderStatus'> {
  user?: PopulatedUser; 
  products: PopulatedOrderProduct[];
  orderStatus: string; 
}

interface ShowOrderPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailsPage({ params }: ShowOrderPageProps) {
  const t = useTranslations('Admin.Orders');
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { products } = useAppSelector((state) => state.products);
  
  // Estados para edición
  const [status, setStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  const ORDER_STATUSES = [
    'Order Placed', 
    'Order Accepted', 
    'Order Processing', 
    'Order Shipped', 
    'Order Delivered', 
    'Order Cancelled'
  ];

  // 1. FETCH DE LA ORDEN
  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) return;

      try {
        const response = await fetch(apiEndPoints.getOrder(id), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Error fetching order');
        
        const data = await response.json();
        const orderData = data.order || data; 
        
        setOrder(orderData);
        setStatus(orderData.orderStatus);
        setPaymentStatus(orderData.paymentStatus);
      } catch (error) {
        console.error(error);
        toast.error(t('toasts.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token, id, t]);

  // 2. ACTUALIZAR ESTADOS
  const handleUpdateOrder = async () => {
    if (!token || !order) return;
    
    setUpdating(true);

    // 1. Disparamos el Thunk y usamos .unwrap()
    // unwrap() convierte el resultado de Redux Toolkit en una Promesa estándar (resolve/reject)
    const updatePromise = dispatch(updateOrder({
        orderId: order._id,
        orderStatus: status,
        paymentStatus: paymentStatus, // Enviamos ambos estados
        token
    })).unwrap();

    // 2. Pasamos esa promesa al Toast
    toast.promise(updatePromise, {
        loading: t('toasts.updating'),
        success: t('toasts.updateSuccess'),
        error: t('toasts.updateError')
    })
    .then(() => {
        // Si todo sale bien, refrescamos la data
        router.refresh(); 
    })
    .catch((error) => {
        console.error("Error al actualizar:", error);
    })
    .finally(() => {
        setUpdating(false);
    });
  };

  // Helpers de formato
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.invalidDate');
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  // --- RENDERIZADO ---

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-mokaze-base text-mokaze-primary">
             <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );
  }

  if (!order) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-mokaze-base">
            <h1 className="text-2xl font-serif text-mokaze-dark">{t('notFound.title')}</h1>
            <Link href="/admin/orders" className="text-mokaze-accent underline flex items-center gap-2">
                <ArrowLeft className="w-4 h-4"/> {t('notFound.backButton')}
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-mokaze-base p-6 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-mokaze-dark/50 hover:text-mokaze-primary mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t('header.backToOrders')}
                </Link>
                <h1 className="text-3xl font-serif font-bold text-mokaze-primary flex items-center gap-3">
                    {t('header.orderTitle')} #{order._id?.slice(-6).toUpperCase()}
                    <span className="text-xs font-sans font-normal bg-mokaze-primary/10 px-3 py-1 rounded-full text-mokaze-primary tracking-widest uppercase">
                        {order.paymentType}
                    </span>
                </h1>
                <p className="text-sm text-mokaze-dark/60 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                </p>
            </div>

            <div className="flex gap-3">
                 <button 
                    onClick={handleUpdateOrder}
                    disabled={updating}
                    className="flex items-center gap-2 bg-mokaze-accent text-white px-6 py-3 rounded-sm shadow-md hover:bg-mokaze-primary transition-all disabled:opacity-50 font-bold text-xs uppercase tracking-widest"
                 >
                    {updating ? t('header.saving') : t('header.saveChanges')}
                    <Save className="w-4 h-4" />
                 </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- COLUMNA IZQUIERDA (Detalles Principales) --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. PRODUCTOS */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-mokaze-dark/5">
                    <h2 className="text-lg font-serif font-bold text-mokaze-primary mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <Package className="w-5 h-5" /> {t('sections.products.title')}
                    </h2>
                    
                    <div className="space-y-6">
                        {order.products.map((item, index) => {
                             const productData = products.find((p) => p._id === item.product && typeof item.product === 'string');
                             
                             const mainImage = productData?.productImages?.[0]?.img;
                             const imageUrl = mainImage?.startsWith('http') 
                                 ? mainImage 
                                 : `${imageBaseUrl}${mainImage}`;

                             return (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="w-16 h-16 bg-gray-100 rounded-sm relative overflow-hidden flex-shrink-0 border border-gray-200">
                                        {mainImage ? (
                                            <Image 
                                                src={imageUrl} 
                                                alt={productData?.name || t('sections.products.defaultAlt')} 
                                                fill 
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-6 h-6"/>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-sm font-bold text-mokaze-dark">
                                            {productData?.name || t('sections.products.unavailable')}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {item.size && (
                                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-sm text-gray-600 uppercase border border-gray-200">
                                                    {t('sections.products.size')}: {item.size}
                                                </span>
                                            )}
                                            {item.color && (
                                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-sm text-gray-600 uppercase border border-gray-200">
                                                    {t('sections.products.color')}: {item.color}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-mokaze-primary">
                                            {formatCurrency(productData?.price || 0)}
                                        </p>
                                        <p className="text-xs text-mokaze-dark/50">x {item.quantity}</p>
                                    </div>
                                </div>
                             )
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-end gap-2">
                        <div className="flex justify-between w-full md:w-1/2 text-sm">
                            <span className="text-mokaze-dark/60">{t('sections.products.totalOrder')}</span>
                            <span className="font-bold text-xl text-mokaze-primary font-serif">
                                {formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. DATOS DE ENVÍO */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-mokaze-dark/5">
                    <h2 className="text-lg font-serif font-bold text-mokaze-primary mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <Truck className="w-5 h-5" /> {t('sections.shipping.title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-xs font-bold text-mokaze-dark/40 uppercase tracking-wider mb-1">
                                {t('sections.shipping.contact')}
                            </p>
                            <p className="font-medium text-mokaze-dark">{order.name}</p>
                            <p className="text-mokaze-dark/70">{order.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-mokaze-dark/40 uppercase tracking-wider mb-1">
                                {t('sections.shipping.address')}
                            </p>
                            <p className="text-mokaze-dark">{order.address.line1}</p>
                            {order.address.line2 && <p className="text-mokaze-dark">{order.address.line2}</p>}
                            <p className="text-mokaze-dark">
                                {order.address.city}, {order.address.state}
                            </p>
                            <p className="text-mokaze-dark">{order.address.postal_code}</p>
                            <p className="text-mokaze-dark font-bold">{order.address.country}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- COLUMNA DERECHA (Controles y Cliente) --- */}
            <div className="lg:col-span-1 space-y-8">
                
                {/* 1. GESTIÓN DE ESTADO */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-mokaze-dark/5">
                    <h2 className="text-lg font-serif font-bold text-mokaze-primary mb-6 pb-4 border-b border-gray-100">
                        {t('sections.management.title')}
                    </h2>

                    <div className="space-y-6">
                        {/* Status de Orden */}
                        <div>
                            <label className="block text-xs font-bold text-mokaze-dark/40 uppercase tracking-wider mb-2">
                                {t('sections.management.orderStatusLabel')}
                            </label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-sm bg-gray-50 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            >
                                {ORDER_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option> 
                                    // Nota: Puedes usar t(`status.order.${s}`) si deseas traducir las opciones
                                ))}
                            </select>
                        </div>

                        {/* Status de Pago */}
                        <div>
                            <label className="block text-xs font-bold text-mokaze-dark/40 uppercase tracking-wider mb-2">
                                {t('sections.management.paymentStatusLabel')}
                            </label>
                            <select 
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-sm bg-gray-50 focus:outline-none focus:border-mokaze-primary transition-colors text-sm"
                            >
                                <option value="pending">{t('status.payment.pending')}</option>
                                <option value="approved">{t('status.payment.approved')}</option>
                                <option value="paid">{t('status.payment.paid')}</option>
                                <option value="rejected">{t('status.payment.rejected')}</option>
                                <option value="refunded">{t('status.payment.refunded')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. INFO DEL PAGO */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-mokaze-dark/5">
                    <h2 className="text-lg font-serif font-bold text-mokaze-primary mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <CreditCard className="w-5 h-5" /> {t('sections.payment.title')}
                    </h2>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-mokaze-dark/60">{t('sections.payment.method')}</span>
                            <span className="font-bold">{order.paymentType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-mokaze-dark/60">{t('sections.payment.transactionId')}</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-sm text-gray-600">
                                {order.paymentInfo?.id || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-mokaze-dark/60">{t('sections.payment.mpStatus')}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                order.paymentInfo?.status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {order.paymentInfo?.status || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CLIENTE REGISTRADO (Si existe) */}
                {order.user ? (
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-mokaze-dark/5">
                        <h2 className="text-lg font-serif font-bold text-mokaze-primary mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                            <User className="w-5 h-5" /> {t('sections.user.registeredTitle')}
                        </h2>
                        <div className="text-sm">
                            <p className="font-bold text-mokaze-dark">{order.user.firstName} {order.user.lastName}</p>
                            <p className="text-mokaze-dark/60">{order.user.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-mokaze-dark/5">
                        <h2 className="text-lg font-serif font-bold text-mokaze-primary mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                            <User className="w-5 h-5" /> {t('sections.user.guestTitle')}
                        </h2>
                        <div className="text-sm text-mokaze-dark/50 italic flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {t('sections.user.guestLabel')}
                        </div>
                    </div>
                )}

            </div>

        </div>
      </div>
    </div>
  );
}