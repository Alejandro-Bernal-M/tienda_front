'use client'
import { useState } from "react";
import Signin from "@/components/session/Signin";
import Signup from "@/components/session/Signup";

export default function Session() {
  const [signin, setSignin] = useState(true);

  return (
    <div className="session-bg">
      {signin ?
        <>
          <Signin /> 
          <button className= "session-btn" onClick={() => setSignin(false)}>Do not have an account? Signup </button>
        </>
        :
        <>
          <Signup />
          <button className= "session-btn" onClick={() => setSignin(true) } >Already have an account? Signin </button>
        </>
        }
    </div>
  );
}