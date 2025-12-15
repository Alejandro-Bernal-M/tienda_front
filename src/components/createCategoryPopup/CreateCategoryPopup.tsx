'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createCategory } from '@/lib/features/categories/categoriesSlice';
import { X, Upload, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CreateCategoryPopupProps {
  onClose: () => void;
}

export default function CreateCategoryPopup({ onClose }: CreateCategoryPopupProps) {
  const t = useTranslations('Admin.createCategory');
  const dispatch = useAppDispatch();
  
  const { loading, error, categories } = useAppSelector((state) => state.categories);
  const { token } = useAppSelector((state) => state.user);
  
  const [fileName, setFileName] = useState<string | null>(null);
  // 1. NUEVO: Estado para errores locales (validación)
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // 1. GUARDAMOS LA REFERENCIA AL FORMULARIO ANTES DEL AWAIT
    const form = e.currentTarget; 

    const formData = new FormData(form);
    const file = formData.get('categoryImage') as File;

    if (!file || file.size === 0 || file.name === '') {
        setValidationError(t('errorImageRequired'));
        return;
    }

    // 2. Aquí ocurre la espera asíncrona (el evento 'e' muere aquí)
    const result = await dispatch(createCategory({ category: formData, token }));
    
    if (createCategory.fulfilled.match(result)) {
      // 3. USAMOS LA VARIABLE 'form' QUE GUARDAMOS AL PRINCIPIO
      form.reset(); 
      setFileName(null);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiamos el error si el usuario selecciona algo
    setValidationError(null);
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  // Combinamos el error de Redux con el error de validación local
  const errorMessage = validationError || error?.message || (typeof error === 'string' ? error : null);

  const inputClass = "w-full bg-transparent border-b border-mokaze-dark/20 py-2 text-mokaze-primary placeholder-mokaze-dark/40 focus:outline-none focus:border-mokaze-accent transition-colors duration-300 text-sm";
  const labelClass = "block text-xs uppercase tracking-widest text-mokaze-dark/50 mb-1 mt-4";

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-sm shadow-2xl relative animate-fade-in border-t-4 border-mokaze-primary max-h-[90vh] overflow-y-auto">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-mokaze-primary font-bold">
          {t('title')}
        </h2>
        <button onClick={onClose} className="text-mokaze-dark/30 hover:text-red-500 transition-colors p-1" type="button">
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* Mostramos el error (sea de validación o del servidor) */}
      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-sm flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        
        <label htmlFor="name" className={labelClass}>{t('nameLabel')}</label>
        <input type="text" id="name" name="name" className={inputClass} required />

        {categories && categories.length > 0 && (
          <>
            <label htmlFor="parent" className={labelClass}>{t('parentLabel')}</label>
            <div className="relative">
              <select id="parent" name="parentId" className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="">{t('noneOption')}</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <label className={labelClass}>{t('imageLabel')}</label>
        <label htmlFor="image" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-sm cursor-pointer hover:border-mokaze-accent hover:bg-mokaze-base/30 transition-all duration-300 group ${validationError ? 'border-red-300 bg-red-50' : 'border-mokaze-dark/20'}`}>
          <div className={`flex flex-col items-center justify-center pt-5 pb-6 group-hover:text-mokaze-accent ${validationError ? 'text-red-400' : 'text-mokaze-dark/40'}`}>
            {fileName ? (
               <>
                 <ImageIcon className="w-8 h-8 mb-2 text-mokaze-primary" />
                 <p className="text-sm text-mokaze-primary font-medium px-2 text-center">{fileName}</p>
               </>
            ) : (
               <>
                 <Upload className="w-8 h-8 mb-2" />
                 <p className="text-xs uppercase tracking-widest">{t('uploadText')}</p>
               </>
            )}
          </div>
          {/* 3. IMPORTANTE: Quitamos 'required' de aquí */}
          <input 
            type="file" 
            id="image" 
            name="categoryImage" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>

        <div className="flex gap-4 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-mokaze-dark/20 text-mokaze-dark/60 uppercase tracking-widest text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm">
                {t('cancel')}
            </button>
            <button type="submit" disabled={loading} className="flex-[2] bg-mokaze-primary text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-md flex justify-center items-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('submit')}
            </button>
        </div>

      </form>
    </div>
  );
}