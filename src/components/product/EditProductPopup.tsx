'use client';

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ProductType, Category } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateProduct } from "@/lib/features/products/productsSlice";
import { X, Trash2, Undo2, Save, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface EditProductPopupProps {
  productForEdit: ProductType;
  categories: Category[] | null;
  setEditPopup: (value: boolean) => void;
}

export default function EditProductPopup({ productForEdit, categories, setEditPopup }: EditProductPopupProps) {
  const t = useTranslations('Admin.editProduct');
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);
  
  // Estados para manejo de UI y lógica
  const [isLoading, setIsLoading] = useState(false);
  const [imagesToDeleteIds, setImagesToDeleteIds] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<{ img: string }[]>([]);
  const [newFilesCount, setNewFilesCount] = useState(0);

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  async function handleProductEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Agregamos los datos de eliminación manuales
    formData.append('imagesToDeleteIds', JSON.stringify(imagesToDeleteIds));
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    
    // Token fallback
    const currentToken = token || localStorage.getItem('token');

    const data = {
      product: formData,
      token: currentToken,
    };

    try {
      const result = await dispatch(updateProduct(data));
      // Cerramos solo si fue exitoso (podrías añadir lógica de chequeo aquí)
      if (updateProduct.fulfilled.match(result)) {
        setEditPopup(false);
        setImagesToDelete([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageDeletion = (imageId: string, img: string) => {
    setImagesToDeleteIds([...imagesToDeleteIds, imageId]);
    setImagesToDelete([...imagesToDelete, { img: img }]);
  }

  const handleCancelImageDeletion = (imageId: string, img: string) => {
    setImagesToDeleteIds(imagesToDeleteIds.filter((id) => id !== imageId));
    setImagesToDelete(imagesToDelete.filter((image) => image.img !== img));
  }

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFilesCount(e.target.files.length);
    }
  }

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
          onClick={() => setEditPopup(false)} 
          className="text-mokaze-dark/30 hover:text-red-500 transition-colors p-1"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form 
        encType="multipart/form-data" 
        onSubmit={handleProductEdit} 
        className="flex-grow overflow-y-auto pr-2 custom-scrollbar"
      >
        <input type="hidden" name="productId" value={productForEdit._id} />
        
        {/* NOMBRE */}
        <label className={labelClass} htmlFor="name">{t('name')}</label>
        <input className={inputClass} type="text" id="name" name="name" defaultValue={productForEdit.name} required />

        {/* GRID: PRECIO, STOCK, OFERTA */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="price">{t('price')}</label>
            <input className={inputClass} type="number" id="price" name="price" defaultValue={productForEdit.price} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="quantity">{t('quantity')}</label>
            <input className={inputClass} type="number" id="quantity" name="quantity" defaultValue={productForEdit.quantity} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="offer">{t('offer')}</label>
            <input className={inputClass} type="number" id="offer" name="offer" defaultValue={productForEdit.offer || 0} min="0" max="100" />
          </div>
        </div>

        {/* TALLAS */}
        <div>
            <label htmlFor="sizes" className={labelClass}>{t('sizes')}</label>
            <input 
          type="text" 
          id="sizes" 
          name="sizes" 
          className={inputClass} 
          defaultValue={productForEdit.sizes ? productForEdit.sizes.join(', ') : ''}
            />
            <p className="text-xs text-mokaze-dark/40 mt-1">{t('sizesHint')}</p>
        </div>

        {/* COLORES */}
        <div>
            <label htmlFor="colors" className={labelClass}>{t('colors')}</label>
            <input 
          type="text" 
          id="colors" 
          name="colors" 
          className={inputClass}
          defaultValue={productForEdit.colors ? productForEdit.colors.join(', ') : ''}
            />
            <p className="text-xs text-mokaze-dark/40 mt-1">{t('colorsHint')}</p>
        </div>

        {/* DESCRIPCIÓN */}
        <label className={labelClass} htmlFor="description">{t('description')}</label>
        <textarea 
          className="w-full bg-transparent border border-mokaze-dark/20 p-3 mt-2 text-mokaze-primary focus:outline-none focus:border-mokaze-accent transition-colors text-sm rounded-sm h-24 resize-none" 
          id="description" 
          name="description" 
          defaultValue={productForEdit.description}
        />

        {/* CATEGORÍA */}
        <label className={labelClass} htmlFor="category">{t('category')}</label>
        <div className="relative">
            {/* Usamos optional chaining (?.) porque category puede ser null */}
            <select 
              className={selectClass} 
              name="category" 
              id="category" 
              defaultValue={productForEdit.category?._id || ""}
            >
              <option value="">{t('selectCategory')}</option>
              {categories && categories.map((category) => (
                <optgroup key={category._id} label={category.name}>
                  <option value={category._id}>{category.name}</option>
                  {category.children && category.children.length > 0 && category.children.map((child) => (
                    <option key={child._id} value={child._id}>
                      &nbsp;&nbsp;&mdash; {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
        </div>

        {/* IMÁGENES EXISTENTES */}
        {productForEdit.productImages && productForEdit.productImages.length > 0 && (
          <div className="mt-6">
            <p className={labelClass}>{t('currentImages')}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-2">
              {productForEdit.productImages.map((image, index) => {
                const isDeleted = imagesToDeleteIds.includes(image._id);
                return (
                  <div key={`${index}-edit`} className="relative group w-full h-24 rounded-sm overflow-hidden border border-gray-200">
                    <Image 
                      src={`${imageBaseUrl}${image.img}`} 
                      alt="Product" 
                      fill 
                      className={`object-cover transition-all duration-300 ${isDeleted ? 'opacity-20 grayscale' : ''}`} 
                    />
                    
                    {/* Botón de Borrar / Deshacer */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isDeleted ? (
                           <button 
                             type="button"
                             onClick={() => handleCancelImageDeletion(image._id, image.img)}
                             className="text-white bg-emerald-500 p-2 rounded-full hover:bg-emerald-600 transition-colors"
                             title="Deshacer"
                           >
                             <Undo2 className="w-4 h-4" />
                           </button>
                        ) : (
                           <button 
                             type="button"
                             onClick={() => handleImageDeletion(image._id, image.img)}
                             className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                             title="Eliminar"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        )}
                    </div>
                    
                    {/* Indicador de borrado */}
                    {isDeleted && (
                        <div className="absolute bottom-0 w-full bg-red-500 text-white text-[10px] text-center py-1 font-bold">
                            {t('markedForDeletion')}
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NUEVAS IMÁGENES */}
        <label className={labelClass} htmlFor="newImage">{t('newImages')}</label>
        <label 
            htmlFor="newImage" 
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-mokaze-dark/20 rounded-sm cursor-pointer hover:border-mokaze-accent hover:bg-mokaze-base/30 transition-all duration-300 group mt-2"
        >
            <div className="flex flex-col items-center justify-center text-mokaze-dark/40 group-hover:text-mokaze-accent">
                {newFilesCount > 0 ? (
                    <>
                         <ImageIcon className="w-6 h-6 mb-1 text-mokaze-primary" />
                         <span className="text-xs text-mokaze-primary font-bold">{newFilesCount} archivos nuevos</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase tracking-widest">{t('uploadText')}</span>
                    </>
                )}
            </div>
            <input 
              className="hidden" 
              type="file" 
              id="newImage" 
              name="productImages" 
              multiple 
              onChange={handleNewFileChange}
              accept="image/*"
            />
        </label>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            className="flex-1 py-3 border border-mokaze-dark/20 text-mokaze-dark/60 uppercase tracking-widest text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm"
            onClick={() => setEditPopup(false)}
          >
            {t('cancel')}
          </button>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex-[2] bg-mokaze-primary text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <><Save className="w-4 h-4" /> {t('save')}</>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}