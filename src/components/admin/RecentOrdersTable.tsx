'use client';

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eye } from "lucide-react";
import { Order } from "@/lib/types" 

// Tu interfaz proporcionada
interface OrderProduct {
    productId: string;
    quantity: number;
    price: number;
}

export default function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const t = useTranslations('Admin.recentOrders');

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Función para asignar colores según el estado
  const getStatusColor = (status: string | string[]) => {
    switch (status) {
      case 'Order Delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Order Shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Order Processing':
      case 'Order Accepted':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Order Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (orders.length === 0) {
    return <div className="p-6 text-center text-mokaze-dark/50 italic">{t('empty')}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-mokaze-primary/10 text-xs uppercase tracking-wider text-mokaze-dark/50">
            <th className="py-4 px-4 font-medium">{t('headers.id')}</th>
            <th className="py-4 px-4 font-medium">{t('headers.customer')}</th>
            <th className="py-4 px-4 font-medium">{t('headers.date')}</th>
            <th className="py-4 px-4 font-medium">{t('headers.total')}</th>
            <th className="py-4 px-4 font-medium">{t('headers.payment')}</th>
            <th className="py-4 px-4 font-medium">{t('headers.status')}</th>
            <th className="py-4 px-4 font-medium text-right">{t('headers.action')}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {orders.map((order) => (
            <tr 
              key={order._id} 
              className="border-b border-mokaze-primary/5 hover:bg-mokaze-primary/5 transition-colors group"
            >
              {/* ID (Acortado visualmente) */}
              <td className="py-4 px-4 font-mono text-xs text-mokaze-dark/70">
                #{order._id.slice(-6).toUpperCase()}
              </td>

              {/* Cliente */}
              <td className="py-4 px-4">
                <div className="font-medium text-mokaze-primary">{order.name}</div>
                <div className="text-xs text-mokaze-dark/50">{order.email}</div>
              </td>

              {/* Fecha */}
              <td className="py-4 px-4 text-mokaze-dark/70">
                {formatDate(order.createdAt)}
              </td>

              {/* Total */}
              <td className="py-4 px-4 font-medium text-mokaze-dark">
                {formatCurrency(order.totalAmount)}
              </td>

              {/* Estado de Pago */}
              <td className="py-4 px-4">
                 <span className={`text-xs px-2 py-1 rounded-sm uppercase tracking-wide font-medium ${
                    order.paymentStatus === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'
                 }`}>
                    {order.paymentStatus}
                 </span>
              </td>

              {/* Estado de la Orden (Pills de colores) */}
              <td className="py-4 px-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </td>

              {/* Acciones */}
              <td className="py-4 px-4 text-right">
                <Link 
                  href={`/admin/orders/${order._id}`} 
                  className="inline-flex items-center justify-center p-2 rounded-full hover:bg-white hover:shadow-sm text-mokaze-dark/60 hover:text-mokaze-accent transition-all"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}