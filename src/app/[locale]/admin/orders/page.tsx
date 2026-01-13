'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateOrderStatus, getOrders } from "@/lib/features/orders/ordersSlice";
import { getAllProducts } from '@/lib/features/products/productsSlice';

import { 
  Edit2, Check, X, MapPin, CreditCard, 
  Calendar, Package, User, Loader2, Search 
} from 'lucide-react';

export default function OrdersPage() {
  const t = useTranslations('Admin.orders');
  const dispatch = useAppDispatch();
  
  const { orders, loadingOrders } = useAppSelector((state) => state.orders);
  const { products } = useAppSelector((state) => state.products);
  const { token } = useAppSelector((state) => state.user);

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
        if (orders.length === 0) dispatch(getOrders({ token }));
        if (products.length === 0) dispatch(getAllProducts());
    }
  }, [dispatch, token, orders.length, products.length]);

  // CORRECCIÓN: Tipamos 'order' como 'any' temporalmente aquí o casteamos status abajo
  const startEditing = (order: any) => {
    setEditingOrderId(order._id);
    // Forzamos a string porque tu interfaz dice que es un array
    setTempStatus(order.orderStatus as unknown as string); 
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setTempStatus('');
  };

  const saveStatus = (orderId: string) => {
    if (orderId && tempStatus) {
      dispatch(updateOrderStatus({ orderId, orderStatus: tempStatus, token }));
      setEditingOrderId(null);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Order Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Order Processing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Order Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-mokaze-base p-6 md:p-12 animate-fade-in">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h1 className="text-3xl font-serif text-mokaze-primary font-bold">{t('title')}</h1>
            <p className="text-mokaze-dark/50 text-sm mt-1">{t('subtitle')}</p>
        </div>
        
        <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mokaze-dark/40 group-focus-within:text-mokaze-accent transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar por ID o Email..." 
                className="pl-10 pr-4 py-3 bg-white border border-mokaze-dark/10 rounded-sm text-sm focus:outline-none focus:border-mokaze-accent w-full md:w-72 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {loadingOrders && orders.length === 0 && (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-mokaze-accent" />
            </div>
        )}

        {!loadingOrders && filteredOrders.length > 0 ? (
          <div className="bg-white rounded-sm border border-mokaze-primary/5 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-mokaze-base/50 border-b border-mokaze-primary/10 text-xs uppercase tracking-wider text-mokaze-dark/50">
                  <th className="py-4 px-4 font-medium">{t('headers.id')} / {t('headers.date')}</th>
                  <th className="py-4 px-4 font-medium">{t('headers.customer')}</th>
                  <th className="py-4 px-4 font-medium">{t('headers.shipping')}</th>
                  <th className="py-4 px-4 font-medium">{t('headers.products')}</th>
                  <th className="py-4 px-4 font-medium">{t('headers.payment')}</th>
                  <th className="py-4 px-4 font-medium">{t('headers.status')}</th>
                  <th className="py-4 px-4 font-medium text-right">{t('headers.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mokaze-primary/5 text-sm">
                {filteredOrders.map((order) => {
                  const statusString = order.orderStatus as unknown as string;

                  return (
                  <tr key={order._id} className="hover:bg-mokaze-base/30 transition-colors group">
                    
                    <td className="py-4 px-4 align-top">
                      <div className="font-mono text-xs text-mokaze-dark/70 mb-1">#{order._id.slice(-6).toUpperCase()}</div>
                      <div className="flex items-center gap-1 text-mokaze-dark/50 text-xs">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-2">
                         <div className="bg-mokaze-sand/30 p-1.5 rounded-full mt-0.5">
                            <User className="w-3 h-3 text-mokaze-primary" />
                         </div>
                         <div>
                            <p className="font-medium text-mokaze-primary">{order.name}</p>
                            <p className="text-xs text-mokaze-dark/50">{order.email}</p>
                            {order.user && <span className="text-[10px] bg-mokaze-primary/10 text-mokaze-primary px-1 rounded-sm">Registrado</span>}
                         </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top max-w-[200px]">
                       <div className="flex items-start gap-1 text-mokaze-dark/70">
                          <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                          <div className="text-xs">
                             <p>{order.address.line1}</p>
                             {order.address.line2 && <p>{order.address.line2}</p>}
                             <p>{order.address.city}, {order.address.state}</p>
                             <p>{order.address.country}, {order.address.postal_code}</p>
                          </div>
                       </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                       <ul className="space-y-1">
                          {order.products.map((item: any, idx: number) => {
                             const productName = products.find(p => p._id === item.product)?.name || 'Producto desconocido';
                             return (
                               <li key={idx} className="flex items-center gap-2 text-xs text-mokaze-dark/80">
                                  <span className="bg-mokaze-dark/5 text-mokaze-dark px-1.5 rounded-sm font-bold">x{item.quantity}</span>
                                  <span className="truncate max-w-[150px]" title={productName}>{productName}</span>
                               </li>
                             )
                          })}
                       </ul>
                    </td>

                    <td className="py-4 px-4 align-top">
                       <div className="font-bold text-mokaze-dark mb-1">{formatCurrency(order.totalAmount)}</div>
                       <div className="flex items-center gap-1 text-xs text-mokaze-dark/60">
                          <CreditCard className="w-3 h-3" />
                          <span className="capitalize">{order.paymentType}</span>
                       </div>
                       <span className={`text-[10px] uppercase font-bold tracking-wide ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                          {order.paymentStatus}
                       </span>
                    </td>

                    {/* Order Status (Editable) */}
                    <td className="py-4 px-4 align-top">
                       {editingOrderId === order._id ? (
                          <div className="flex items-center gap-2">
                             <select 
                                value={tempStatus} 
                                onChange={(e) => setTempStatus(e.target.value)}
                                className="bg-white border border-mokaze-accent text-xs rounded-sm py-1 pl-2 pr-6 focus:outline-none"
                             >
                                <option value="Order Placed">Placed</option>
                                <option value="Order Accepted">Accepted</option>
                                <option value="Order Processing">Processing</option>
                                <option value="Order Shipped">Shipped</option>
                                <option value="Order Delivered">Delivered</option>
                                <option value="Order Cancelled">Cancelled</option>
                             </select>
                          </div>
                       ) : (
                          // 🔥 USAMOS LA VARIABLE CONVERTIDA (statusString)
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusString)}`}>
                             {statusString.replace('Order ', '')}
                          </span>
                       )}
                    </td>

                    <td className="py-4 px-4 align-top text-right">
                       {editingOrderId === order._id ? (
                          <div className="flex justify-end gap-1">
                             <button onClick={() => saveStatus(order._id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-sm hover:bg-emerald-200" title="Guardar">
                                <Check className="w-4 h-4" />
                             </button>
                             <button onClick={cancelEditing} className="p-1.5 bg-red-100 text-red-700 rounded-sm hover:bg-red-200" title="Cancelar">
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       ) : (
                          <button 
                             onClick={() => startEditing(order)} 
                             className="p-2 text-mokaze-dark/40 hover:text-mokaze-accent hover:bg-mokaze-sand/20 rounded-full transition-colors"
                             title="Editar Estado"
                          >
                             <Edit2 className="w-4 h-4" />
                          </button>
                       )}
                    </td>

                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
           !loadingOrders && (
             <div className="text-center py-20 bg-white rounded-sm border border-dashed border-mokaze-dark/20 flex flex-col items-center">
                <Package className="w-12 h-12 text-mokaze-dark/20 mb-4" />
                <p className="text-mokaze-dark/40 italic">{t('empty')}</p>
             </div>
           )
        )}
      </div>
    </div>
  );
}