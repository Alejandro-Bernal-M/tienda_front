'use client'
import styles from './Navbar.module.css';
import Link from 'next/link';
import { useAppSelector, useAppDispatch} from "../../lib/hooks";
import { signOut, signIn } from '@/lib/features/user/userSlice';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation'
import { hideCart, displayCart, getCartItemsDB } from '@/lib/features/cart/cartSlice';
import CartPopup from '../cart/CartPopup';
import { getAllProducts } from '@/lib/features/products/productsSlice';
import { getHomeSections } from '@/lib/features/homeSection/homeSectionsSlice';
import Image from 'next/image'; 

export default function Navbar() {
  const {user} = useAppSelector((state) => state.user);
  const {token} = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const pathName = usePathname();
  const allowedRoutes = ['/session', '/', '/products', '/cart', '/checkout', '/checkout/success', '/checkout/cancel'];
  const { showCart } = useAppSelector((state) => state.cart);

  const handleSignOut = () => {
    dispatch(signOut());
  }

  useEffect(() => {
    if (typeof window !== 'undefined') { // Check if running in the browser
      if (token === '' && user.email === '') {
        const storageToken = window.localStorage.getItem('token');
        const storageUser = window.localStorage.getItem('user');
        if (storageToken && storageUser) {
          dispatch(signIn({ token: storageToken, user: JSON.parse(storageUser) }));
          dispatch(getCartItemsDB(storageToken));
        }
      }
      dispatch(getAllProducts());
      dispatch(getHomeSections());
    }
  }, []);

  function secureRoute() {
    if (user.email === '' && !allowedRoutes.includes(pathName)) {
      window.location.href = '/session';
    }
  }

  function adminRoute() {
    if (user.role !== 'admin' && pathName.includes('/admin')) {
      window.location.href = '/';
    }
  }

  function active() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      if (link.href === window.location.href) {
        if(link.classList.contains('no_active')) return;
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  useEffect(() => {
    secureRoute();
    adminRoute();
    active();
  }
  , [pathName]);
  
  return (
    <nav className={styles.navbar__outside}>
      <div className={styles.navbar__top}>
        <p>
          Free Shipping for orders over $75
        </p>
      </div>
      <div className={styles.navbar}>
        <div className={styles.navbar__logo} >logo</div>
        <ul className={styles.navbar__links} >
          <li className={styles.navbar__link}>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.navbar__link}>
            <Link href="/products">Products</Link>
          </li>
          <li className={styles.navbar__link}>
            <button className='button_transparent' onClick={() => showCart ? dispatch(hideCart()) : dispatch(displayCart())}>
              <Image src="/cart.svg" alt="cart" width={20} height={20} /> {/* Use the Image component as a JSX component */}
            </button>
          </li>
          {showCart && <CartPopup />}
          <li className={styles.navbar__link}>
            {token ? (
              <button className='button_transparent' onClick={handleSignOut}>Signout</button>
            ) : (
              <Link href="/session">Signin</Link>
            )
          }
          </li>
          { user.role === 'admin' && (
            <li className={styles.navbar__link}>
              <Link href="/admin" >Admin</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}