import type { ProductType } from '@/lib/types';
import styles from './product.module.css';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { addItem } from '@/lib/features/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addItemToCartDB } from '@/lib/features/cart/cartSlice';

export default function Product(product: ProductType) {
  const dispatch = useAppDispatch();
  const [currentImage, setCurrentImage] = useState(0);
  const pathname = usePathname();
  const [productQuantity, setProductQuantity] = useState(1);
  const { token } = useAppSelector((state) => state.user);

  function handleAddToCart() {
    if (productQuantity === 0) return;
    if (productQuantity > product.quantity) {
      alert('The quantity you want to add is greater than the quantity available');
      return;
    }
    let productWithQuantity = { ...product, quantity: productQuantity };

    dispatch(addItem(productWithQuantity));
    if ( product._id && token) {
      let newPrice = product.price;
      if (product.offer) {
        newPrice = product.price - product.price * product.offer / 100;
      }
      let item = {
        _id: product._id,
        quantity: productQuantity,
        price: newPrice,
        offer: product.offer,
      };
      dispatch(addItemToCartDB({ item, token }));
    }
    if (pathname === '/products') {
      alert('Product added to cart');
    }

    setProductQuantity(1);
  }

  return (
    <div className={styles.productContainer}>
      <h2 className={styles.productTitle}>{product.name}</h2>
      {pathname === '/admin/products' && (
        <>
          <p className={styles.productInfo}>Category: {product.category?.name}</p>
          <p className={styles.productInfo}>Created by: {product.createdBy?.firstName}</p>
        </>
      )}
      {product.productImages && product.productImages.length > 0 && (
        <>
          <img 
            src={`${process.env.NEXT_PUBLIC_IMAGES}${product.productImages[currentImage].img}`} 
            alt={product.name} 
            className={styles.productImage} 
          />
          <div className={styles.imageNavButtons}>
            {product.productImages.length > 1 && currentImage > 0 && (
              <button 
                onClick={() => setCurrentImage(currentImage - 1)}
              >
                Previous Image
              </button>
            )}
            {product.productImages.length > 1 && currentImage + 1 < product.productImages.length && (
              <button 
                onClick={() => setCurrentImage(currentImage + 1)}
              >
                Next Image
              </button>
            )}
          </div>
        </>
      )}
      <p className={styles.productDescription}>{product.description}</p>
      {product.offer && (
        <p className={styles.productOffer}>Offer: {product.offer}%</p>
      )}
      <p className={styles.productPrice}>Price: {product.price}</p>
      { product.offer && (<p className={styles.productPrice}>
        Price with discount: {product.offer ? (product.price - product.price * product.offer / 100) : product.price}
      </p>)}
      <p className={styles.productInfo}>Quantity available: {product.quantity}</p>

      <div className={styles.productQuantity}>
        <span>Select the quantity to add</span>
        <input 
          type="number" 
          min={1} 
          max={product.quantity} 
          value={productQuantity} 
          onChange={(e) => setProductQuantity(parseInt(e.target.value))} 
        />
      </div>
      <div className={styles.productButtons}>
        <button onClick={handleAddToCart}>Add products</button>
      </div>
    </div>
  );
}
