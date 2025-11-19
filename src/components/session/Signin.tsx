import apiEndPoints from "@/utils/routes";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { signIn } from "@/lib/features/user/userSlice";
import { getCartItemsDB } from "@/lib/features/cart/cartSlice";
import { useRouter } from 'next/navigation';

export default function Signin() {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  function handleSignin(e:any) {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = data.get('email');
    const password = data.get('password');
    const body = { email, password };
    try {
      fetch(apiEndPoints.signin, {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify(body),
      })
        .then(async (res) => {
          if (res.ok) {
            e.target.reset();
            const data = await res.json();
            dispatch(signIn(data));
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch(getCartItemsDB(data.token));
            router.push('/products');
          } else if (res.status === 400) {
            const data = await res.json();
            console.error(data.message);
          } else {
            console.error('Unknown error occurred');
          }
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="adminContainer">
      <h1 className="adminTitle">Signin</h1>
      <form className="signinForm" encType="multipart/form-data" onSubmit={handleSignin}>
        <input className="signinInput" name="email" type="email" placeholder="Email" />
        <input className="signinInput" name="password" type="password" placeholder="Password" />
        <button className="button_style_1" type="submit">Signin</button>
      </form>
      {user.firstName && <h2 className="welcomeMessage">Welcome {user.firstName}</h2>}
    </div>
  );
}
