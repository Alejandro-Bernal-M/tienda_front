'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import CreateCategoryPopup from '@/components/createCategoryPopup/CreateCategoryPopup';
import EditCategoryPopup from '@/components/EditCategoryPopup/EditCategoryPopup';
import { Category } from '@/lib/types';
import { deleteCategory } from '@/lib/features/categories/categoriesSlice';

// Iconos e UI
import { Plus, Edit2, Trash2, CornerDownRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminCategories() {
  const t = useTranslations('Admin.categories');
  const dispatch = useAppDispatch();
  
  // Estado de Redux
  const { categories, loading, error } = useAppSelector((state) => state.categories);
  const { token } = useAppSelector((state) => state.user);

  // Estado Local
  const [displayCategoryPopup, setDisplayCategoryPopup] = useState(false);
  const [editCategoryPopup, setEditCategoryPopup] = useState(false);
  
  // Datos para edición
  const [categoryForEdit, setCategoryForEdit] = useState({} as Category);
  const [categoriesForEdit, setCategoriesForEdit] = useState<null | Category[]>(null);

  // URL Base de Imágenes
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  function handleEdit(category: Category) {
    if (category) {
      setCategoryForEdit(category);
      // Pasamos toda la lista para que puedan elegir un nuevo padre si es necesario
      if (categories.length > 0) {
        setCategoriesForEdit(categories);
      }
      setEditCategoryPopup(true);
    }
  }

  function handleDelete(category: Category) {
    if (!confirm(t('confirmDelete'))) return;

    // Usamos el token de Redux preferiblemente, fallback a localStorage
    const currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
        console.error("No token found");
        return;
    }

    const data = {
      _id: category._id,
      token: currentToken,
    };

    try {
      dispatch(deleteCategory(data));
    } catch (error) {
      console.error(error);
    }
  }

  // Renderizado de una fila (se usa para padres e hijos para evitar repetir código)
  const CategoryRow = ({ cat, isChild = false, parentName = '' }: { cat: Category, isChild?: boolean, parentName?: string }) => (
    <tr className={`border-b border-mokaze-primary/5 hover:bg-mokaze-primary/5 transition-colors group ${isChild ? 'bg-mokaze-base/30' : ''}`}>
      
      {/* 1. Imagen */}
      <td className="py-4 px-4 w-24">
        <div className="relative w-12 h-12 rounded-sm overflow-hidden border border-mokaze-primary/10 bg-white">
          <Image 
            src={`${imageBaseUrl}${cat.categoryImage}`} 
            alt={cat.name} 
            fill 
            className="object-cover"
          />
        </div>
      </td>

      {/* 2. Nombre (Con indentación visual si es hijo) */}
      <td className="py-4 px-4">
        <div className={`flex items-center gap-3 ${isChild ? 'pl-8' : ''}`}>
           {isChild && <CornerDownRight className="w-4 h-4 text-mokaze-accent/70" />}
           <span className={`text-mokaze-primary ${isChild ? 'text-sm font-normal' : 'font-medium text-base'}`}>
             {cat.name}
           </span>
        </div>
      </td>

      {/* 3. Padre */}
      <td className="py-4 px-4 text-sm text-mokaze-dark/60">
        {isChild ? (
            <span className="bg-mokaze-sand/50 px-2 py-1 rounded-sm text-xs">
                {parentName}
            </span>
        ) : (
            <span className="text-mokaze-dark/30">-</span>
        )}
      </td>

      {/* 4. Acciones */}
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => handleEdit(cat)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Editar"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button 
                onClick={() => handleDelete(cat)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Eliminar"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-mokaze-base p-6 md:p-12 animate-fade-in relative">
      
      {/* --- Header --- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-serif text-mokaze-primary font-bold">
            {t('title')}
            </h1>
            <p className="text-mokaze-dark/50 text-sm mt-1">
                Organiza la estructura de tu tienda
            </p>
        </div>
        
        <button 
            onClick={() => setDisplayCategoryPopup(true)}
            className="flex items-center gap-2 bg-mokaze-primary text-white px-6 py-3 rounded-sm hover:bg-mokaze-accent transition-colors shadow-lg hover:shadow-xl text-sm tracking-widest uppercase font-bold"
        >
            <Plus className="w-4 h-4" />
            {t('createBtn')}
        </button>
      </div>

      {/* --- Content --- */}
      <div className="max-w-6xl mx-auto">
        
        {/* Loading State */}
        {loading && (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-mokaze-accent" />
                <span className="ml-3 text-mokaze-dark/60">{t('loading')}</span>
            </div>
        )}

        {/* Error State */}
        {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-sm flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        )}

        {/* Categories Table */}
        {!loading && categories && categories.length > 0 ? (
            <div className="bg-white rounded-sm border border-mokaze-primary/5 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-mokaze-base/50 border-b border-mokaze-primary/10 text-xs uppercase tracking-wider text-mokaze-dark/50">
                            <th className="py-4 px-4 font-medium">{t('headers.image')}</th>
                            <th className="py-4 px-4 font-medium">{t('headers.name')}</th>
                            <th className="py-4 px-4 font-medium">{t('headers.parent')}</th>
                            <th className="py-4 px-4 font-medium text-right">{t('headers.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <div key={category._id} className="contents">
                                {/* Fila Padre */}
                                <CategoryRow cat={category} />
                                
                                {/* Filas Hijos (Mapeadas inmediatamente después del padre) */}
                                {category.children && category.children.length > 0 && category.children.map((child: Category) => (
                                    <CategoryRow 
                                        key={child._id} 
                                        cat={child} 
                                        isChild={true} 
                                        parentName={category.name} 
                                    />
                                ))}
                            </div>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            !loading && (
                <div className="text-center py-20 bg-white rounded-sm border border-dashed border-mokaze-dark/20">
                    <p className="text-mokaze-dark/40 italic">{t('empty')}</p>
                </div>
            )
        )}
      </div>

      {/* --- Popups Modals --- */}
      {/* Nota: Asumimos que los Popups tienen su propio overlay, si no, habría que envolverlos */}
      {displayCategoryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-sm shadow-2xl relative max-h-[90vh] overflow-y-auto">
                 {/* Botón de cerrar manual si el componente no lo trae */}
                 <button onClick={() => setDisplayCategoryPopup(false)} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
                    <Plus className="w-6 h-6 rotate-45 text-gray-500" />
                 </button>
                 <CreateCategoryPopup onClose={() => setDisplayCategoryPopup(false)} />
             </div>
        </div>
      )}

      {editCategoryPopup && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-sm shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setEditCategoryPopup(false)} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full z-10">
                    <Plus className="w-6 h-6 rotate-45 text-gray-500" />
                 </button>
                <EditCategoryPopup 
                    categories={categoriesForEdit} 
                    category={categoryForEdit} 
                    setEditPopup={setEditCategoryPopup} 
                />
             </div>
         </div>
      )}

    </div>
  );
}