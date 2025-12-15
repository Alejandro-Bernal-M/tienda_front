'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createProduct } from "@/lib/features/products/productsSlice";
import { X, Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

interface CreateProductPopupProps {
  setDisplayPopup: (value: boolean) => void;
}

export default function CreateProductPopup({ setDisplayPopup }: CreateProductPopupProps) {
  const t = useTranslations('Admin.createProduct');
  const dispatch = useAppDispatch();
  
  const { token } = useAppSelector((state) => state.user);
  const { categories } = useAppSelector((state) => state.categories); // Asumimos que ya están cargadas en el padre

  // Estados locales
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // 1. Guardamos referencia al formulario
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validación manual de imágenes (opcional, ya que el input tiene 'required')
    const files = formData.getAll('productImages');
    if (files.length === 0 || (files[0] as File).size === 0) {
        setError("Please select at least one image");
        setIsLoading(false);
        return;
    }

    const data = {
      product: formData,
      token: token,
    };

    try {
      // 2. Despachamos la acción
      const response = await dispatch(createProduct(data));
      
      if (createProduct.fulfilled.match(response)) {
        setSuccess(t('success'));
        form.reset();
        setSelectedFilesCount(0);
        
        // Cerrar después de 2 segundos
        setTimeout(() => {
            setDisplayPopup(false);
        }, 1500);
      } else {
        setError(t('error'));
      }
    } catch (error) {
      console.error(error);
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setSelectedFilesCount(e.target.files.length);
    }
  };

  // Clases CSS reutilizables
  const labelClass = "block text-xs uppercase tracking-widest text-mokaze-dark/50 mb-1 mt-4";
  const inputClass = "w-full bg-transparent border-b border-mokaze-dark/20 py-2 text-mokaze-primary placeholder-mokaze-dark/40 focus:outline-none focus:border-mokaze-accent transition-colors duration-300 text-sm";
  const selectClass = "w-full bg-transparent border-b border-mokaze-dark/20 py-2 text-mokaze-primary focus:outline-none focus:border-mokaze-accent transition-colors duration-300 text-sm appearance-none cursor-pointer";

  return (
    <div className="w-full h-full bg-white p-8 animate-fade-in flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-serif text-mokaze-primary font-bold">
          {t('title')}
        </h2>
        <button 
            onClick={() => setDisplayPopup(false)} 
            className="text-mokaze-dark/30 hover:text-red-500 transition-colors p-1"
        >
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* MENSAJES DE ESTADO */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-sm flex items-center gap-2 animate-pulse flex-shrink-0">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-sm flex items-center gap-2 animate-pulse flex-shrink-0">
          <CheckCircle className="w-5 h-5" /> {success}
        </div>
      )}

      {/* FORMULARIO (Scrollable area) */}
      <form 
        encType="multipart/form-data" 
        onSubmit={handleProductSubmit} 
        className="flex-grow overflow-y-auto pr-2 custom-scrollbar"
      >
        
        {/* NOMBRE */}
        <label htmlFor="name" className={labelClass}>{t('name')}</label>
        <input type="text" id="name" name="name" required className={inputClass} />

        {/* PRECIO Y CANTIDAD (Grid) */}
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label htmlFor="price" className={labelClass}>{t('price')}</label>
                <input type="number" id="price" name="price" required className={inputClass} min="0" step="0.01" />
            </div>
            <div>
                <label htmlFor="quantity" className={labelClass}>{t('quantity')}</label>
                <input type="number" id="quantity" name="quantity" required className={inputClass} min="0" />
            </div>
        </div>

        {/* CATEGORÍA Y DESCUENTO (Grid) */}
        <div className="grid grid-cols-2 gap-6 mt-2">
            <div>
                <label htmlFor="category" className={labelClass}>{t('category')}</label>
                <div className="relative">
                    <select id="category" name="category" required className={selectClass}>
                        <option value="">{t('selectCategory')}</option>
                        {categories && categories.map((cat) => (
                            <optgroup key={cat._id} label={cat.name}>
                                {/* Opción para seleccionar al padre mismo si es necesario, o solo mostrarlo como grupo */}
                                <option value={cat._id}>{cat.name}</option>
                                {cat.children && cat.children.map((child) => (
                                    <option key={child._id} value={child._id}>
                                        &nbsp;&nbsp;&mdash; {child.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="offer" className={labelClass}>{t('offer')}</label>
                <input type="number" id="offer" name="offer" min="0" max="100" className={inputClass} placeholder="0" />
            </div>
        </div>

        {/* DESCRIPCIÓN */}
        <label htmlFor="description" className={labelClass}>{t('description')}</label>
        <textarea 
            id="description" 
            name="description" 
            required 
            className="w-full bg-transparent border border-mokaze-dark/20 p-3 mt-2 text-mokaze-primary placeholder-mokaze-dark/40 focus:outline-none focus:border-mokaze-accent transition-colors duration-300 text-sm rounded-sm h-24 resize-none" 
        />

        {/* IMÁGENES (Custom Input) */}
        <label className={labelClass}>{t('images')}</label>
        <label 
            htmlFor="productImages" 
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-mokaze-dark/20 rounded-sm cursor-pointer hover:border-mokaze-accent hover:bg-mokaze-base/30 transition-all duration-300 group mt-2"
        >
            <div className="flex flex-col items-center justify-center text-mokaze-dark/40 group-hover:text-mokaze-accent">
                {selectedFilesCount > 0 ? (
                    <>
                        <ImageIcon className="w-8 h-8 mb-2 text-mokaze-primary" />
                        <p className="text-sm text-mokaze-primary font-medium">
                            {selectedFilesCount} {t('filesSelected')}
                        </p>
                    </>
                ) : (
                    <>
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-xs uppercase tracking-widest">{t('uploadText')}</p>
                    </>
                )}
            </div>
            {/* Input 'multiple' para subir varias */}
            <input 
                type="file" 
                id="productImages" 
                name="productImages" 
                accept="image/*" 
                multiple 
                required 
                className="hidden" 
                onChange={handleFileChange}
            />
        </label>

        {/* BOTÓN SUBMIT */}
        <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-8 bg-mokaze-primary text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('loading')}
                </>
            ) : (
                t('submit')
            )}
        </button>

      </form>
    </div>
  );
}