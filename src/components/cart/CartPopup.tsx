'use client'
import { useAppDispatch } from "@/lib/hooks";
import { useAppSelector } from "@/lib/hooks";
import Link from "next/link";
import { clearCart, clearCartDB  } from "@/lib/features/cart/cartSlice";
import styles from "./cartPopup.module.css";

export default function CartPopup() {
	const dispatch = useAppDispatch();
	const { token } = useAppSelector((state) => state.user);
	const { products } = useAppSelector((state) => state.products);
	const { items, totalPrices, totalProducts } = useAppSelector((state) => state.cart);

  function handleClearCart() {
    if(token) {
      dispatch(clearCartDB(token));
    }
    dispatch(clearCart());
  }

	return (
		<div className={styles.cart_popup}>
			<h1 className={styles.cart_popup_title} >Your Cart</h1>
			<p>Total Products: {totalProducts}</p>
			<p>Total Price: {totalPrices}</p>
			{items.length > 0 && items.map((item) => (
				<div key={item._id}>
					<p>{item.quantity} x {products.find((product) => product._id === item._id)?.name}</p>
					<p>Unitary price: {item.price}</p>
					<p>Subtotal: {item.price * item.quantity}</p>
				</div>
			))}
			<div className={styles.cart_popup_buttons}>
				<button className="button_style_1" >
					<Link className="no_active" href="/cart">
						Inspect your cart
					</Link>
				</button>
				<button  className="button_style_1" onClick={ handleClearCart }>Clean Cart</button>
			</div>
		</div>
	)
}