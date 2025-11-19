import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { clearCart, clearCartDB  } from "@/lib/features/cart/cartSlice";
import apiEndPoints from "@/utils/routes";
import styles from "./CheckoutButton.module.css"

export default function CheckoutButton(){
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.user);

  const handleCheckout = async () => {
    console.log('Checkout button clicked');
    console.log(items)
    let productsToCheckout = items.map((item) => {
      return {
        _id: item._id,
        quantity: item.quantity,
      }
    });
    let data;
    if(user._id){
      data = {
        items: productsToCheckout,
        userId: user._id
      }
    }else {
      data = {
        items: productsToCheckout
      }
    }
    try {
      const response = await fetch(apiEndPoints.checkoutSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data),
      });
      if(response.status === 200){
        const result = await response.json();
        console.log('result', result);
        window.location.href = result.session.url;
      }else {
        console.log('error', response)
      }

    } catch (error) {
      console.error(error);
    };
  }
  return (
    <button className={styles.checkoutButton} onClick={handleCheckout}  >
      Checkout
    </button>
  )
}