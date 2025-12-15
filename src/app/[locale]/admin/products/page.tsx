'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { deleteProduct, getAllProducts } from '@/lib/features/products/productsSlice';
import { getCategories } from '@/lib/features/categories/categoriesSlice';
import { ProductType as Product } from '@/lib/types';

// Componentes
import CreateProductPopup from '@/components/product/CreateProductPopup';
import EditProductPopup from '@/components/product/EditProductPopup';

// Iconos
import { Plus, Edit2, Trash2, Loader2, Search, PackageOpen, Tag } from 'lucide-react';


export default function AdminProducts() {
  const t = useTranslations('Admin.products');
  const dispatch = useAppDispatch();
  
  // Redux States (Casteamos products como Product[])
  const { products, loading, error } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const { token } = useAppSelector((state) => state.user);

  // Local States
  const [displayPopup, setDisplayPopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [productForEdit, setProductForEdit] = useState({} as Product);
  const [searchTerm, setSearchTerm] = useState('');

  // URL Base
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  useEffect(() => {
    // Siempre cargamos productos y categorías al entrar
    dispatch(getAllProducts());
    if (categories.length === 0) dispatch(getCategories());
  }, [dispatch, categories.length]);

  function handleEdit(product: any) { // Usamos any o Product
    if (product) {
      setProductForEdit(product);
      setEditPopup(true);
    }
  }

  function handleDelete(product: Product) {
    if (!product._id) return;
    if (!confirm(t('confirmDelete'))) return;

    const currentToken = token || localStorage.getItem('token');
    const data = {
      _id: product._id,
      token: currentToken,
    };
    try {
      dispatch(deleteProduct(data));
    } catch (error) {
      console.error(error);
    }
  }

  // Filtrado por búsqueda
  const filteredProducts = (products as Product[]).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-mokaze-base p-6 md:p-12 animate-fade-in relative">
      
      {/* --- Header --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h1 className="text-3xl font-serif text-mokaze-primary font-bold">
            {t('title')}
            </h1>
            <p className="text-mokaze-dark/50 text-sm mt-1">
                {t('subtitle')} ({products.length})
            </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mokaze-dark/40 group-focus-within:text-mokaze-accent transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    className="pl-10 pr-4 py-3 bg-white border border-mokaze-dark/10 rounded-sm text-sm focus:outline-none focus:border-mokaze-accent w-full md:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Botón Crear */}
            <button 
                onClick={() => setDisplayPopup(true)}
                className="flex items-center justify-center gap-2 bg-mokaze-primary text-white px-6 py-3 rounded-sm hover:bg-mokaze-accent transition-colors shadow-lg hover:shadow-xl text-sm tracking-widest uppercase font-bold"
            >
                <Plus className="w-4 h-4" />
                {t('createBtn')}
            </button>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="max-w-7xl mx-auto">
        
        {loading && (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-mokaze-accent" />
                <span className="ml-3 text-mokaze-dark/60">{t('loading')}</span>
            </div>
        )}

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-sm mb-6 border border-red-100">
                {typeof error === 'string' ? error : 'Error al cargar productos'}
            </div>
        )}

        {/* TABLA DE PRODUCTOS */}
        {!loading && filteredProducts.length > 0 ? (
            <div className="bg-white rounded-sm border border-mokaze-primary/5 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-mokaze-base/50 border-b border-mokaze-primary/10 text-xs uppercase tracking-wider text-mokaze-dark/50">
                            <th className="py-4 px-4 font-medium">{t('headers.image')}</th>
                            <th className="py-4 px-4 font-medium">{t('headers.name')}</th>
                            <th className="py-4 px-4 font-medium">{t('headers.category')}</th>
                            <th className="py-4 px-4 font-medium">{t('headers.price')}</th>
                            <th className="py-4 px-4 font-medium">{t('headers.stock')}</th>
                            <th className="py-4 px-4 font-medium text-right">{t('headers.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mokaze-primary/5">
                        {filteredProducts.map((product) => {
                            // Lógica para obtener la imagen principal
                            const mainImage = product.productImages && product.productImages.length > 0 
                                ? product.productImages[0].img 
                                : null;

                            return (
                            <tr key={product._id} className="hover:bg-mokaze-base/30 transition-colors group">
                                
                                {/* 1. Imagen (Manejando array) */}
                                <td className="py-3 px-4 w-20">
                                    <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                                        {mainImage ? (
                                            <Image 
                                                src={`${imageBaseUrl}${mainImage}`} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300">
                                                <PackageOpen className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* 2. Nombre */}
                                <td className="py-3 px-4">
                                    <span className="font-medium text-mokaze-primary block">{product.name}</span>
                                    <span className="text-xs text-mokaze-dark/40 truncate max-w-[200px] block">
                                        {product.description?.substring(0, 30)}...
                                    </span>
                                </td>

                                {/* 3. Categoría (Objeto directo) */}
                                <td className="py-3 px-4 text-sm text-mokaze-dark/70">
                                    <span className="bg-mokaze-sand/30 px-2 py-1 rounded-sm text-xs border border-mokaze-sand/50">
                                        {product.category?.name || 'Sin Categoría'}
                                    </span>
                                </td>

                                {/* 4. Precio (Con indicador de oferta) */}
                                <td className="py-3 px-4 font-medium text-mokaze-dark">
                                    <div className="flex flex-col">
                                        <span>${product.price}</span>
                                        {product.offer && product.offer > 0 && (
                                            <span className="text-[10px] text-orange-600 flex items-center gap-1">
                                                <Tag className="w-3 h-3" /> {product.offer}% OFF
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* 5. Stock (Quantity) */}
                                <td className="py-3 px-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        product.quantity > 0 
                                            ? 'bg-emerald-50 text-emerald-600' 
                                            : 'bg-red-50 text-red-600'
                                    }`}>
                                        {product.quantity > 0 ? `${product.quantity} un.` : 'Agotado'}
                                    </span>
                                </td>

                                {/* 6. Acciones */}
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        ) : (
            !loading && (
                <div className="text-center py-20 bg-white rounded-sm border border-dashed border-mokaze-dark/20 flex flex-col items-center">
                    <PackageOpen className="w-12 h-12 text-mokaze-dark/20 mb-4" />
                    <p className="text-mokaze-dark/40 italic">{t('empty')}</p>
                </div>
            )
        )}
      </div>

      {/* --- Popups --- */}
      
      {displayPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-sm shadow-2xl relative max-h-[90vh] overflow-y-auto w-full max-w-2xl">
                 <CreateProductPopup setDisplayPopup={setDisplayPopup} /> 
             </div>
        </div>
      )}

      {editPopup && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-sm shadow-2xl relative max-h-[90vh] overflow-y-auto w-full max-w-2xl">
                <EditProductPopup 
                    productForEdit={productForEdit} 
                    categories={categories}
                    setEditPopup={setEditPopup} 
                />
             </div>
         </div>
      )}

    </div>
  );
}