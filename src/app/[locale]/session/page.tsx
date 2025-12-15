'use client';

import { useState } from "react";
import Signin from "@/components/session/Signin";
import Signup from "@/components/session/Signup";
import { useTranslations } from "next-intl";

export default function SessionPage() {
  const [isSignin, setIsSignin] = useState(true);
  const t = useTranslations('Session.toggle');

  return (
    // Fondo general
    <div className="min-h-screen w-full bg-mokaze-base flex items-center justify-center p-4 py-20">
      
      {/* Tarjeta Contenedora Glassmorphism */}
      <div className="w-full max-w-lg bg-white/60 backdrop-blur-xl border border-mokaze-primary/5 shadow-2xl rounded-sm overflow-hidden animate-fade-in">
        
        {/* Renderizado Condicional del Formulario */}
        <div className="p-8 md:p-12">
          {isSignin ? <Signin /> : <Signup />}
        </div>

        {/* Barra Inferior de Toggle (Gris/Arena) */}
        <div className="bg-mokaze-sand/30 p-4 text-center border-t border-mokaze-primary/5">
          <button 
            className="text-sm text-mokaze-primary hover:text-mokaze-accent transition-colors font-medium tracking-wide"
            onClick={() => setIsSignin(!isSignin)}
          >
            {isSignin ? t('toSignup') : t('toSignin')}
          </button>
        </div>

      </div>
    </div>
  );
}