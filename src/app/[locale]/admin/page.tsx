'use client';

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllProducts } from '@/lib/features/products/productsSlice';
import { getCategories } from '@/lib/features/categories/categoriesSlice';
import { getOrders } from "@/lib/features/orders/ordersSlice";
import { getHomeSections } from '@/lib/features/homeSection/homeSectionsSlice';
import { Package, Layers, ShoppingCart, LayoutTemplate, ArrowRight } from 'lucide-react';
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import { Order } from "@/lib/types";

export default function AdminPage() {
  const t = useTranslations('Admin.dashboard');
  const tOrders = useTranslations('Admin.recentOrders'); // Traducciones para el título de la tabla
  const dispatch = useAppDispatch();
  
  const { token } = useAppSelector((state) => state.user);
  const { products } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const { orders } = useAppSelector((state) => state.orders);
  const { homeSections } = useAppSelector((state) => state.homeSections);

  useEffect(() => {
    if (token) {
        dispatch(getCategories());
        dispatch(getAllProducts());
        dispatch(getOrders({ token }));
        dispatch(getHomeSections());
    }
  }, [dispatch, token]);

  const stats = [
    {
      title: t('products'),
      count: products.length,
      href: "/admin/products",
      icon: <Package className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: t('categories'),
      count: categories.length,
      href: "/admin/categories",
      icon: <Layers className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-700"
    },
    {
      title: t('orders'),
      count: orders.length,
      href: "/admin/orders",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      title: t('homeSections'),
      count: homeSections?.length || 0,
      href: "/admin/home-sections",
      icon: <LayoutTemplate className="w-6 h-6" />,
      color: "bg-orange-50 text-orange-700"
    }
  ];

  // Filtramos las últimas 5 órdenes y nos aseguramos de que cumplan la interfaz
  // Nota: Asumiendo que 'orders' viene de Redux ordenado, si no, usa .sort()
  const recentOrders = orders
    .slice() // Copia para no mutar el estado
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Ordenar descendente
    .slice(0, 5) as Order[];

  return (
    <div className="min-h-screen bg-mokaze-base p-6 md:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-serif text-mokaze-primary font-bold mb-2">
            {t('title')}
          </h1>
          <p className="text-mokaze-dark/60">
            {t('subtitle')}
          </p>
        </div>

        {/* 1. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link 
              key={index} 
              href={stat.href}
              className="group bg-white p-6 rounded-sm border border-mokaze-primary/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-sm ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 text-mokaze-dark/40">
                    <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-mokaze-dark block mb-1">
                    {stat.count}
                </span>
                <span className="text-sm font-medium text-mokaze-dark/50 uppercase tracking-wider">
                    {stat.title}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-mokaze-primary/10 group-hover:bg-mokaze-accent transition-colors duration-300"></div>
            </Link>
          ))}
        </div>

        {/* 2. Recent Orders Section */}
        <div className="bg-white rounded-sm border border-mokaze-primary/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-mokaze-primary/5 flex justify-between items-center bg-mokaze-base/30">
                <h2 className="text-xl font-serif text-mokaze-primary font-bold">
                    {tOrders('title')}
                </h2>
                <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest text-mokaze-accent hover:text-mokaze-primary transition-colors">
                    {t('viewAll')}
                </Link>
            </div>
            
            {/* Tabla Componente */}
            <RecentOrdersTable orders={recentOrders} />
        </div>
        
      </div>
    </div>
  );
};