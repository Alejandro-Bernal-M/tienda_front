'use client'
import { useAppDispatch } from "@/lib/hooks";
import Link from "next/link";
import { clearCart, clearCartDB, subtractQuantityFromCartDB, removeItemFromCartDB, removeItem  } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import apiEndPoints from "@/utils/routes";
import Product from "@/components/product/Product";
import { removeItemQuantity } from "@/lib/features/cart/cartSlice";
import { useState } from "react";
import { ProductType} from "@/lib/types";
import CheckoutButton from "@/components/checkoutButton/CheckoutButton";
import styles from './CartPage.module.css';

export default function CartPage(){
  const { items, totalProducts, totalPrices } = useAppSelector((state) => state.cart);
  const { token } = useAppSelector((state) => state.user);
  const { products } = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();
  const [productQuantity, setProductQuantity] = useState(0);

  function handleClearCart() {
    if(token) {
      dispatch(clearCartDB(token));
    }
    dispatch(clearCart());
  }

  async function handleCheckout() {
    let productsToCheckout = items.map((item) => {
      return {
        _id: item._id,
        quantity: item.quantity,
      }
    }
    );

    const data = {
      cartItems: productsToCheckout,
      totalAmount: totalPrices,
    }

    try {
      const response = await fetch(apiEndPoints.checkProductsForCheckout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log('result', result);
      if(result.checkStatus){
        window.location.href = '/checkout';
      }else {
        console.log('error', result.message)
      }
      alert(result.message)
    } catch (error) {
      alert('An error occurred, please try again later');
      console.error(error);
    }
  }

  function handleRemoveFromCart(_id: string) {
    let value = document.getElementById(_id + '-remove-value') as HTMLInputElement;
    let quantity = parseInt(value.value);
    if(quantity === 0) return;
    if(_id){
      dispatch(removeItemQuantity({_id: _id, quantity: quantity}));
      if(token){
        let info = {
          _id: _id,
          quantity: quantity,
        }
        dispatch(subtractQuantityFromCartDB({item: info, token: token}));
      }
    }
  }

  function handleRemoveItemFromCart(_id: string) {
    if(_id){
      dispatch(removeItem(_id));
      if(token){
        dispatch(removeItemFromCartDB({productId: _id, token: token}));
      }
    }
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Your Cart</h1>
      <p>Total Products: {totalProducts}</p>
      <p>Total Price: {totalPrices}</p>
      {items.length > 0 && items.map((item) => (
        <div key={item._id} className={styles.cartItem}>
          { products.map((product:ProductType, index) => {
            if(product._id === item._id){
              return(
                <> 
                <Product key={index} {...product} />
                { item.quantity > 0 && (
                  <>
                    <span>Select the quantity to remove</span>
                    <div className={styles.cartItemQuantity}>
                      <input type="number" id={item._id + '-remove-value'} max={item.quantity} defaultValue={item.quantity} />
                      <button onClick={ () => handleRemoveFromCart(item._id) }  className={styles.cartButton}>Remove products</button>
                    </div>
                  </>
                ) }
                <div className={styles.cartItemDetails}>
                  <p className={styles.cartItemName}>{item.quantity} x {product.name}</p>
                  <p className={styles.cartItemPrice}>Unitary price: {item.price}</p>
                  <p className={styles.cartItemPrice}>Subtotal: {item.price * item.quantity}</p>
                </div>
                <button onClick={ () => handleRemoveItemFromCart(item._id) } className={styles.cartButton}>Remove this product</button>
                </> 
              )
            }}
          )}
          
        </div>
      ))}
      <div className={styles.cartButtons}>
        <CheckoutButton  />
        <button onClick={ handleClearCart } className={styles.cartButton}>Clean Cart</button>
      </div>
      <p className={styles.cartTotal}>Total Price: {totalPrices}</p>
    </div>
  );
}