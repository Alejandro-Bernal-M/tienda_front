'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { ShoppingBag, User, Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { signOut, signIn } from '@/lib/features/user/userSlice';
import { hideCart, displayCart, getCartItemsDB } from '@/lib/features/cart/cartSlice';
import { getAllProducts } from '@/lib/features/products/productsSlice';
import { getHomeSections } from '@/lib/features/homeSection/homeSectionsSlice';
import CartPopup from '../cart/CartPopup';

// Definimos las rutas públicas fuera del componente para que no se recreen en cada render
// Nota: Usamos startsWith para cubrir subrutas (ej: /products/id)
const PUBLIC_ROUTES_PREFIXES = ['/session', '/products', '/cart', '/checkout'];
const EXACT_PUBLIC_ROUTES = ['/'];

export default function Navbar() {
  const t = useTranslations('Navbar');
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  
  // Estados de Redux
  const { user, token } = useAppSelector((state) => state.user);
  const { showCart, items } = useAppSelector((state) => state.cart);
  
  // Estado local
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 🔥 NUEVO: Estado para saber si ya leímos el LocalStorage
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. LÓGICA DE HIDRATACIÓN (Carga inicial)
  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window !== 'undefined') {
        // Solo intentamos recuperar sesión si Redux está vacío
        if (!token) {
          const storageToken = window.localStorage.getItem('token');
          const storageUser = window.localStorage.getItem('user');

          if (storageToken && storageUser) {
            // Restauramos sesión
            dispatch(signIn({ token: storageToken, user: JSON.parse(storageUser) }));
            // Cargamos carrito
            dispatch(getCartItemsDB(storageToken));
          }
        }
        
        // Carga de datos públicos (siempre necesaria)
        dispatch(getAllProducts());
        dispatch(getHomeSections());
        
        // ✅ Marcamos que la app ya intentó leer el almacenamiento
        setIsHydrated(true);
      }
    };

    initializeApp();
  }, [dispatch, token]); // Eliminamos user.email de dependencias para evitar loops

  // 2. LÓGICA DE PROTECCIÓN (Solo corre si ya estamos hidratados)
  useEffect(() => {
    // 🛑 Si no hemos terminado de cargar, NO hacemos nada. Evita falsos redireccionamientos.
    if (!isHydrated) return;

    // Verificar si la ruta actual es pública
    const isPublic = 
      EXACT_PUBLIC_ROUTES.includes(pathname) || 
      PUBLIC_ROUTES_PREFIXES.some(prefix => pathname.startsWith(prefix));
    
    const isAdminRoute = pathname.startsWith('/admin');

    // CASO A: Usuario NO logueado intentando entrar a ruta privada
    if (!token && !isPublic) {
      // Usamos 'replace' para que no puedan volver atrás con el botón del navegador
      router.replace('/session'); 
      return;
    }

    // CASO B: Usuario logueado pero SIN permisos de Admin
    if (token && isAdminRoute && user.role !== 'admin') {
      router.replace('/');
      return;
    }

    // CASO C: Usuario logueado intentando entrar a Login/Registro (/session)
    if (token && pathname === '/session') {
      router.replace('/');
    }

  }, [pathname, token, user.role, isHydrated, router]);

  // Lógica de cierre de sesión
  const handleSignOut = () => {
    dispatch(signOut());
    setIsMobileMenuOpen(false);
    // Limpiamos storage manual por si acaso
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }
    router.push('/');
  };

  const isActive = (route: string) => pathname === route;

  // Renderizado (Igual que antes)
  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* ... (El resto de tu JSX se mantiene idéntico) ... */}
      
      {/* --- TOP BAR --- */}
      <div className="bg-mokaze-primary text-mokaze-base text-[10px] md:text-xs py-2 text-center tracking-[0.2em] uppercase font-medium">
        {t('freeShipping')}
      </div>

      <nav className="bg-mokaze-base/90 backdrop-blur-md border-b border-mokaze-primary/5 w-full relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl md:text-3xl font-serif font-bold text-mokaze-primary tracking-widest hover:opacity-80 transition-opacity">
                MOKAZE
              </Link>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex space-x-8 items-center">
              <NavLink href="/" active={isActive('/')}>{t('home')}</NavLink>
              <NavLink href="/products" active={isActive('/products')}>{t('shop')}</NavLink>
              {user.role === 'admin' && (
                <NavLink href="/admin" active={pathname.includes('/admin')}>
                  <span className="flex items-center gap-1 text-mokaze-accent">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </span>
                </NavLink>
              )}
            </div>

            {/* ICONS */}
            <div className="hidden md:flex items-center space-x-6">
              {token ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-mokaze-primary/60 tracking-widest uppercase">
                    Hola, {user.fullName?.split(' ')[0] || 'Viajero'}
                  </span>
                  <button onClick={handleSignOut} title="Cerrar Sesión" className="text-mokaze-dark/60 hover:text-mokaze-accent transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/session" className="text-mokaze-dark/70 hover:text-mokaze-accent transition-colors">
                  <User className="w-5 h-5" />
                </Link>
              )}

              <div className="relative">
                <button 
                  onClick={() => showCart ? dispatch(hideCart()) : dispatch(displayCart())}
                  className="text-mokaze-dark/70 hover:text-mokaze-accent transition-colors flex items-center"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-mokaze-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {items.length}
                    </span>
                  )}
                </button>
                {showCart && (
                  <div className="absolute right-0 top-10 z-50">
                    <CartPopup />
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE BUTTON */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                  onClick={() => showCart ? dispatch(hideCart()) : dispatch(displayCart())}
                  className="text-mokaze-dark/70"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-mokaze-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                      {items.length}
                    </span>
                  )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-mokaze-primary p-1"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-mokaze-base border-t border-mokaze-mist absolute w-full shadow-lg animate-fade-in z-40">
            <div className="px-6 py-6 space-y-4 flex flex-col">
              <MobileLink href="/" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</MobileLink>
              <MobileLink href="/products" onClick={() => setIsMobileMenuOpen(false)}>{t('shop')}</MobileLink>
              
              <hr className="border-mokaze-dark/10" />
              
              {token ? (
                <>
                  <span className="text-sm text-mokaze-primary/50 uppercase tracking-widest mb-2 block">Cuenta</span>
                  {user.role === 'admin' && (
                    <MobileLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</MobileLink>
                  )}
                  <button onClick={handleSignOut} className="text-left text-mokaze-accent uppercase tracking-widest text-sm font-medium">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <MobileLink href="/session" onClick={() => setIsMobileMenuOpen(false)}>Iniciar Sesión</MobileLink>
              )}
            </div>
          </div>
        )}

        {showCart && isMobileMenuOpen && (
           <div className="absolute top-full w-full z-50 md:hidden">
             <CartPopup />
           </div>
        )}
      </nav>
    </header>
  );
}

// Helpers visuales (igual que antes)
function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        text-xs lg:text-sm uppercase tracking-[0.15em] font-medium transition-all duration-300 relative group py-2
        ${active ? 'text-mokaze-accent' : 'text-mokaze-primary hover:text-mokaze-accent'}
      `}
    >
      {children}
      <span className={`absolute bottom-0 left-0 h-[1px] bg-mokaze-accent transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-mokaze-primary text-lg font-serif hover:text-mokaze-accent transition-colors"
    >
      {children}
    </Link>
  );
}