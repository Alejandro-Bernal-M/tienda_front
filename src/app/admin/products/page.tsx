'use client'
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import CreateProductPopup from '@/components/createProductPopup/CreateProductPopup';
import styles from './adminProducts.module.css';
import Product from '@/components/product/Product';
import { ProductType, Category } from '@/lib/types';
import EditProductPopup from '@/components/product/EditProductPopup';
import { deleteProduct } from '@/lib/features/products/productsSlice';

export default function AdminProducts() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const [displayPopup, setDisplayPopup] = useState(false);
  const [ productForEdit, setProductForEdit ] = useState({} as ProductType);
  const [ categoriesForEdit, setCategoriesForEdit ] = useState<null | Category[]>(null);
  const [ editPopup, setEditPopup ] = useState(false);

  function handleEdit(product: ProductType) {
    if (product) {
      setProductForEdit(product);
      setCategoriesForEdit(categories.length > 0 ? categories : []);
      setEditPopup(true);
    } else {
      console.error('Invalid product:', product);
    }
  }

  function handleDelete(product: ProductType) {
    const data = {
      _id: product._id,
      token: localStorage.getItem('token'),
    };
    try {
      dispatch(deleteProduct(data));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.adminProductsContainer}>
      <h1>Admin Products</h1>
      <button className={styles.createProductButton} onClick={() => setDisplayPopup(!displayPopup)}>
        Create Product
      </button>
      {displayPopup && <CreateProductPopup setDisplayPopup={setDisplayPopup} />}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div>
        <p>Number of products: {products ? products.length : 0}</p>
      </div>
      {products.length === 0 && !loading && <p>No products found</p>}
      {products.length > 0 && products.map((product, index) => (
        <div key={`${product._id}-${index}`} className={styles.productContainer}>
          <Product {...product} />
          <button onClick={() => handleEdit(product)} className={styles.editButton}>Edit</button>
          <button onClick={() => handleDelete(product)} className={styles.deleteButton}>Delete</button>
        </div>
      ))}
      {editPopup && <EditProductPopup productForEdit={productForEdit} categories={categoriesForEdit} setEditPopup={setEditPopup} />}
    </div>
  );
}
