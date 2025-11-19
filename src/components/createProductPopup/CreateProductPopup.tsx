import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createProduct } from "@/lib/features/products/productsSlice";
import styles from "./createProductPopup.module.css";

export default function CreateProductPopup({ setDisplayPopup }: { setDisplayPopup: (value: boolean) => void }) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);
  const { categories } = useAppSelector((state) => state.categories);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProductSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target);

    const data = {
      product: formData,
      token: token,
    };

    try {
      const response = await dispatch(createProduct(data));
      if (response.type === 'products/createProduct/fulfilled') {
        setSuccess("Product created successfully!");
        e.target.reset();
        setTimeout(() => setDisplayPopup(false), 2000); // Close the popup after 2 seconds
      } else {
        setError("Failed to create the product. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.popup}>
      <button className={styles.closeButton} onClick={() => setDisplayPopup(false)}>×</button>
      <h2>Create Product</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form encType="multipart/form-data" onSubmit={handleProductSubmit} className={styles.form}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input type="text" id="name" name="name" required className={styles.input} />

        <label htmlFor="price" className={styles.label}>Price</label>
        <input type="number" id="price" name="price" required className={styles.input} />

        <label htmlFor="description" className={styles.label}>Description</label>
        <textarea id="description" name="description" required className={styles.textarea} />

        <label htmlFor="quantity" className={styles.label}>Quantity</label>
        <input type="number" id="quantity" name="quantity" required className={styles.input} />

        <label htmlFor="productImages" className={styles.label}>Product Images</label>
        <input type="file" id="productImages" name="productImages" accept="image/*" multiple required className={styles.input} />

        <label htmlFor="category" className={styles.label}>Category</label>
        <select id="category" name="category" required className={styles.select}>
          <option value="">Select Category</option>
          {categories && categories.length > 0 && categories.map((category) => (
            <>
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
              {category.children && category.children.length > 0 && category.children.map((child) => (
                <option key={child._id + 'child'} value={child._id}>
                  {child.name}
                </option>
              ))}
            </>
          ))}
        </select>

        <label htmlFor="offer" className={styles.label}>Discount</label>
        <input type="number" name="offer" min={0} max={100} className={styles.input} />

        <button type="submit" className={styles.submitButton}>Create Product</button>
      </form>
    </div>
  );
}
