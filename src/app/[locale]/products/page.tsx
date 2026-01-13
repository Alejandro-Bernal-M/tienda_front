'use client';

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllProducts } from '@/lib/features/products/productsSlice';
import { getCategories } from '@/lib/features/categories/categoriesSlice';
import Product from '@/components/product/Product';
import { Loader2, Filter, ChevronRight, PackageOpen } from "lucide-react";

export default function Products() {
  const t = useTranslations('Products');
  const dispatch = useAppDispatch();
  
  const { products, error, loading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [activeCategoryName, setActiveCategoryName] = useState<string>('');

  useEffect(() => {
    if (products.length === 0) dispatch(getAllProducts());
    if (categories.length === 0) dispatch(getCategories());
  }, [dispatch, products.length, categories.length]);

  // --- LÓGICA DE FILTRADO PADRE E HIJOS ---
  const filteredProducts = useMemo(() => {
    // 1. Si está en 'all', devuelve todo
    if (activeCategoryId === 'all') {
      return products;
    }

    // 2. Buscamos la categoría activa para ver si tiene hijos
    const selectedCategory = categories.find(c => c._id === activeCategoryId);
    
    // 3. Creamos una lista de IDs permitidos (El ID del padre + los IDs de los hijos)
    const validCategoryIds = new Set<string>();
    
    // Agregamos el ID seleccionado (Padre)
    validCategoryIds.add(activeCategoryId);

    // Si tiene hijos, agregamos sus IDs también
    if (selectedCategory && selectedCategory.children) {
        selectedCategory.children.forEach(child => {
            if (child._id) validCategoryIds.add(child._id);
        });
    }

    // 4. Filtramos los productos
    return products.filter((product) => {
        // Validación de seguridad
        if (!product.category || !product.category._id) return false;
        
        // Chequeamos si la categoría del producto está en la lista de permitidos (Padre o Hijos)
        return validCategoryIds.has(product.category._id);
    });
  }, [activeCategoryId, products, categories]); // Importante: agregar 'categories' a dependencias

  const handleCategorySelect = (id: string, name: string) => {
    setActiveCategoryId(id);
    setActiveCategoryName(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-mokaze-base animate-fade-in">
      
      {/* HEADER HERO */}
      <div className="bg-mokaze-primary text-white py-12 md:py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-mokaze-sand/80 uppercase tracking-widest text-xs font-bold">
           Mokaze Collection
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 flex flex-col md:flex-row gap-10">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            
            <div className="flex items-center gap-2 mb-6 text-mokaze-primary border-b border-mokaze-primary/10 pb-2">
                <Filter className="w-4 h-4" />
                <h3 className="font-serif font-bold text-lg">{t('categories')}</h3>
            </div>

            <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 custom-scrollbar">
                {/* Opción Todas */}
                <li className="flex-shrink-0">
                    <button
                        onClick={() => handleCategorySelect('all', t('allProducts'))}
                        className={`w-full text-left px-4 py-3 rounded-sm text-sm transition-all duration-300 flex justify-between items-center group ${
                            activeCategoryId === 'all' 
                            ? 'bg-mokaze-primary text-white shadow-md' 
                            : 'bg-white text-mokaze-dark/70 hover:bg-mokaze-sand/30 hover:text-mokaze-primary'
                        }`}
                    >
                        {t('allProducts')}
                        {activeCategoryId === 'all' && <ChevronRight className="w-4 h-4" />}
                    </button>
                </li>

                {categories.map((category) => (
                    <li key={category._id} className="relative group flex-shrink-0">
                         {/* Botón Categoría Padre */}
                        <button
                            onClick={() => handleCategorySelect(category._id ?? '', category.name ?? '')}
                            className={`w-full text-left px-4 py-3 rounded-sm text-sm transition-all duration-300 flex justify-between items-center ${
                                activeCategoryId === category._id 
                                ? 'bg-mokaze-primary text-white shadow-md' 
                                : 'bg-white text-mokaze-dark/70 hover:bg-mokaze-sand/30 hover:text-mokaze-primary'
                            }`}
                        >
                            {category.name}
                            {category.children && category.children.length > 0 && (
                                <ChevronRight className={`w-3 h-3 transition-transform ${activeCategoryId === category._id ? 'rotate-90 md:rotate-0' : ''}`} />
                            )}
                        </button>

                        {/* Subcategorías con "Puente Invisible" arreglado */}
                        {category.children && category.children.length > 0 && (
                            <div className="hidden md:group-hover:block absolute left-full top-0 pl-2 w-56 z-20">
                                <div className="bg-white border border-mokaze-primary/10 shadow-xl rounded-sm animate-fade-in p-1">
                                    <ul className="py-1">
                                        {category.children.map((child) => (
                                            <li key={child._id}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCategorySelect(child._id ?? '', child.name ?? '');
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
                                                        activeCategoryId === child._id
                                                        ? 'text-mokaze-accent font-bold bg-mokaze-base'
                                                        : 'text-mokaze-dark/60 hover:text-mokaze-primary hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {child.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
          </div>
        </aside>

        {/* --- MAIN GRID --- */}
        <main className="flex-grow">
            
            <div className="mb-8 border-b border-mokaze-primary/10 pb-4">
                <h2 className="text-2xl font-serif text-mokaze-primary">
                    {activeCategoryId === 'all' 
                        ? t('subtitleAll') 
                        : (
                            <span className="flex items-center gap-2">
                                {t('subtitleCategory')} <span className="font-bold text-mokaze-accent">{activeCategoryName}</span>
                            </span>
                        )
                    }
                </h2>
                <p className="text-xs text-mokaze-dark/40 mt-1 uppercase tracking-widest">
                    {filteredProducts.length} Productos encontrados
                </p>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 className="w-10 h-10 animate-spin text-mokaze-primary mb-4" />
                    <p className="text-sm tracking-widest uppercase">{t('loading')}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 p-6 text-center text-red-600 rounded-sm">
                    {t('error')}
                </div>
            )}

            {!isLoading && !error && (
                filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <div key={product._id} className="animate-fade-in-up">
                                <Product {...product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-dashed border-mokaze-dark/10">
                        <PackageOpen className="w-16 h-16 text-mokaze-dark/10 mb-4" />
                        <p className="text-mokaze-dark/50 italic font-serif text-lg">{t('empty')}</p>
                        <button 
                            onClick={() => handleCategorySelect('all', t('allProducts'))}
                            className="mt-4 text-xs font-bold uppercase tracking-widest text-mokaze-accent hover:text-mokaze-primary border-b border-mokaze-accent hover:border-mokaze-primary transition-colors pb-0.5"
                        >
                            Ver todos los productos
                        </button>
                    </div>
                )
            )}
        </main>
      </div>
    </div>
  );
}