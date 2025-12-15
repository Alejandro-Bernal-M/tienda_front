'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateCategory } from "@/lib/features/categories/categoriesSlice";
import { Category } from "@/lib/types";
import { X, Upload, Save, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface EditCategoryPopupProps {
  categories: Category[] | null;
  category: Category;
  setEditPopup: (value: boolean) => void;
}

export default function EditCategoryPopup({ categories, category, setEditPopup }: EditCategoryPopupProps) {
  const t = useTranslations('Admin.editCategory');
  const dispatch = useAppDispatch();
  
  // CORRECCIÓN IMPORTANTE: Extraemos loading y error de 'categories', no de 'user'
  const { loading, error } = useAppSelector((state) => state.categories);
  const { token } = useAppSelector((state) => state.user);
  
  const [fileName, setFileName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    `${process.env.NEXT_PUBLIC_IMAGES}${category.categoryImage}`
  );

  async function handleCategoryEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentToken = token || localStorage.getItem('token');
    
    const data = {
      category: formData,
      token: currentToken,
    };

    // Usamos el resultado de la acción para saber si cerrar o no
    const result = await dispatch(updateCategory(data));
    
    if (updateCategory.fulfilled.match(result)) {
        setEditPopup(false);
    }
    // Si falla, el error se actualizará en Redux y se mostrará abajo
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  // Helper para el mensaje de error
  const errorMessage = error?.message || (typeof error === 'string' ? error : null);

  const inputClass = "w-full bg-transparent border-b border-mokaze-dark/20 py-2 text-mokaze-primary placeholder-mokaze-dark/40 focus:outline-none focus:border-mokaze-accent transition-colors duration-300 text-sm";
  const labelClass = "block text-xs uppercase tracking-widest text-mokaze-dark/50 mb-1 mt-4";

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-sm shadow-2xl relative animate-fade-in border-t-4 border-mokaze-accent max-h-[90vh] overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-mokaze-primary font-bold">
          {t('title')}
        </h2>
        <button onClick={() => setEditPopup(false)} className="text-mokaze-dark/30 hover:text-red-500 transition-colors p-1" type="button">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* --- BLOQUE DE ERROR --- */}
      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-sm flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form encType="multipart/form-data" onSubmit={handleCategoryEdit}>
        <input type="hidden" name="_id" value={category._id} />
        
        <label htmlFor="name" className={labelClass}>{t('nameLabel')}</label>
        <input type="text" id="name" name="name" defaultValue={category.name} className={inputClass} required />

        <label className={labelClass}>{t('currentImage')}</label>
        <div className="flex gap-4 items-start">
          <div className="relative w-24 h-24 border border-mokaze-primary/10 rounded-sm overflow-hidden flex-shrink-0 bg-gray-50">
            <Image src={imagePreview} alt="Category Preview" fill className="object-cover" />
          </div>

          <label className="flex-grow flex flex-col items-center justify-center h-24 border-2 border-dashed border-mokaze-dark/20 rounded-sm cursor-pointer hover:border-mokaze-accent hover:bg-mokaze-base/30 transition-all duration-300 group">
             <div className="flex flex-col items-center justify-center text-mokaze-dark/40 group-hover:text-mokaze-accent">
                {fileName ? (
                    <>
                        <ImageIcon className="w-5 h-5 mb-1 text-mokaze-primary" />
                        <span className="text-xs text-mokaze-primary truncate max-w-[150px]">{fileName}</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] uppercase tracking-widest">{t('changeImage')}</span>
                    </>
                )}
             </div>
             <input type="file" name='categoryImage' accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {categories && categories.length > 0 && (
          <>
            <label htmlFor="parent" className={labelClass}>{t('parentLabel')}</label>
            <div className="relative">
              <select id="parent" name="parentId" defaultValue={category.parentId} className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="">{t('noneOption')}</option>
                {categories.map((cat) => (
                  (cat._id !== category._id) && (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  )
                ))}
              </select>
               <div className="absolute right-0 top-3 pointer-events-none text-mokaze-dark/40">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-4 mt-8">
            <button type="button" onClick={() => setEditPopup(false)} className="flex-1 py-3 border border-mokaze-dark/20 text-mokaze-dark/60 uppercase tracking-widest text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm">
                {t('cancel')}
            </button>

            <button type="submit" disabled={loading} className="flex-[2] bg-mokaze-primary text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-md flex justify-center items-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                   <> <Save className="w-4 h-4" /> {t('submit')} </>
                )}
            </button>
        </div>

      </form>
    </div>
  );
}