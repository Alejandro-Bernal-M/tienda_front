import { ProductType, Category } from "@/lib/types"
import { useAppDispatch } from "@/lib/hooks"
import { updateProduct } from "@/lib/features/products/productsSlice";
import { useState } from "react";
import styles from "./editProductPopup.module.css"

export default function EditProductPopup({ productForEdit, categories, setEditPopup }: { productForEdit: ProductType, categories: Category[] | null, setEditPopup: (value: boolean) => void }) {
  const [imagesToDeleteIds, setImagesToDeleteIds] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<{ img: string }[]>([]);
  const dispatch = useAppDispatch();

  function handleProductEdit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('imagesToDeleteIds', JSON.stringify(imagesToDeleteIds));
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    const data = {
      product: formData,
      token: localStorage.getItem('token'),
    };
    try {
      dispatch(updateProduct(data));
    } catch (error) {
      console.error(error);
    }
    setEditPopup(false);
    setImagesToDelete([]);
  }

  const handleImageDeletion = (imageId: string, img: string) => {
    setImagesToDeleteIds([...imagesToDeleteIds, imageId]);
    setImagesToDelete([...imagesToDelete, { img: img }]);
  }

  const handleCancelImageDeletion = (imageId: string, img: string) => {
    setImagesToDeleteIds(imagesToDeleteIds.filter((id) => id !== imageId));
    setImagesToDelete(imagesToDelete.filter((image) => image.img !== img));
  }

  return (
    <div className={styles.popupContainer}>
      <form encType="multipart/form-data" onSubmit={handleProductEdit} className={styles.form}>
        <input className={styles.input} type="hidden" name="productId" value={productForEdit._id} />
        <label className={styles.label} htmlFor="name">Name</label>
        <input className={styles.input} type="text" id="name" name="name" defaultValue={productForEdit.name} />
        <label className={styles.label} htmlFor="price">Price</label>
        <input className={styles.input} type="number" id="price" name="price" defaultValue={productForEdit.price} />
        <label className={styles.label} htmlFor="quantity">Quantity</label>
        <input className={styles.input} type="number" id="quantity" name="quantity" defaultValue={productForEdit.quantity} />
        <label className={styles.label} htmlFor="offer">Offer</label>
        <input className={styles.input} type="number" id="offer" name="offer" defaultValue={productForEdit.offer} />
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea className={styles.textarea} id="description" name="description" defaultValue={productForEdit.description}></textarea>
        {productForEdit.productImages && productForEdit.productImages.length > 0 && (
          <div className={styles.imageSection}>
            <p>Images</p>
            {productForEdit.productImages.map((image, index) => (
              <div key={`${index}-image-edit`} className={styles.imageItem}>
                <img src={`${process.env.NEXT_PUBLIC_IMAGES}${image.img}`} alt={productForEdit.name} className={styles.productImage} />
                <span className={styles.deleteImage} onClick={() => handleImageDeletion(image._id, image.img)}>Delete Image</span>
                {imagesToDeleteIds.includes(image._id) && (
                  <>
                    <p>Image will be deleted</p>
                    <span className={styles.cancelDeletion} onClick={() => handleCancelImageDeletion(image._id, image.img)}>Cancel deletion</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <label className={styles.label} htmlFor="newImage">New Images</label>
        <input className={styles.input} type="file" id="newImage" name="productImages" multiple />
        <label className={styles.label} htmlFor="category">Category</label>
        {categories && categories.length > 0 && (
          <select className={styles.select} name="category" id="category" defaultValue={productForEdit.category._id}>
            {categories.map((category) => (
              <>
                <option key={category._id + 'createpopup'} value={category._id}>{category.name}</option>
                {category.children && category.children.length > 0 && category.children.map((child) => (
                  <option key={child._id + 'child-create-popup'} value={child._id}>{child.name}</option>
                ))}
              </>
            ))}
          </select>
        )}
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>Edit</button>
          <button type="button" className={styles.cancelButton} onClick={() => setEditPopup(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
