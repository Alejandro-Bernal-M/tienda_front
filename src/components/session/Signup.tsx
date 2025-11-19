import apiEndPoints from "@/utils/routes";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { signIn } from "@/lib/features/user/userSlice";
import { useState } from "react";

export default function Signup() {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [admin, setAdmin] = useState(false);

  function validatePasswordSecurity() {
    const password = document.querySelector('input[name="password"]') as HTMLInputElement;
    password.style.borderColor = password.value.length < 8 ? 'red' : 'green';
  }

  function validatePasswordMatch() {
    const password = document.querySelector('input[name="password"]') as HTMLInputElement;
    const passwordConfirmation = document.querySelector('input[name="passwordConfirmation"]') as HTMLInputElement;
    passwordConfirmation.style.borderColor = password.value !== passwordConfirmation.value ? 'red' : 'green';
  }

  function validatePassword(password: string, passwordConfirmation: string) {
    return password === passwordConfirmation;
  }

  function handleSignup(e: any) {
    e.preventDefault();
    const data = new FormData(e.target);
    const password = data.get('password');
    const passwordConfirmation = data.get('passwordConfirmation');
    if (!validatePassword(password as string, passwordConfirmation as string)) {
      console.log('Passwords do not match');
      return;
    }
    try {
      fetch(apiEndPoints.signup, {
        method: "POST",
        body: data,
      })
        .then(async (res) => {
          if (res.ok) {
            e.target.reset();
            const password = document.querySelector('input[name="password"]') as HTMLInputElement;
            const passwordConfirmation = document.querySelector('input[name="passwordConfirmation"]') as HTMLInputElement;
            password.style.borderColor = 'black';
            passwordConfirmation.style.borderColor = 'black';
            const data = await res.json();
            dispatch(signIn(data));
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return;
          } else {
            throw new Error('error');
          }
        })
        .then((data) => {
          console.log('Signup successful');
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="formContainer">
      <h1 className="formTitle">Signup</h1>
      <form className="authForm" encType="multipart/form-data" onSubmit={handleSignup}>
        <input name="firstName" type="text" placeholder="First Name" className="inputField" />
        <input name="lastName" type="text" placeholder="Last Name" className="inputField" />
        <input name="email" type="email" placeholder="Email" className="inputField" />
        <input name="username" type="text" placeholder="Username" className="inputField" />
        <input name="contactNumber" type="text" placeholder="Contact Number" className="inputField" />
        <input name="password" type="password" placeholder="Password" className="inputField" onKeyUp={validatePasswordSecurity} />
        <input name="passwordConfirmation" type="password" placeholder="Confirm Password" className="inputField" onKeyUp={validatePasswordMatch} />
        
        <label className="fileUploadLabel">
          Upload Profile Image
          <input name="profileImage" type="file" className="fileInput" />
        </label>
        
        <input name="role" type="hidden" value={admin ? 'admin' : 'user'} readOnly />
        <input name="adminPassword" type="text" placeholder="Admin Password" className="inputField" style={admin ? { display: 'block' } : { display: 'none' }} />

        <button type="submit" className="primaryButton">Signup</button>
      </form>
      <button onClick={() => setAdmin(!admin)} className="secondaryButton" style={{ marginTop: '15px' }}>
        {admin ? 'Switch to User' : 'Admin'}
      </button>
    </div>
  );
}
