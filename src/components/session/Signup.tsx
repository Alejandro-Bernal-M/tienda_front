'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from '@/i18n/navigation';
import { useAppDispatch } from "@/lib/hooks";
import { signIn } from "@/lib/features/user/userSlice";
import apiEndPoints from "@/utils/routes";
import { Loader2, Upload, AlertCircle, ShieldAlert } from "lucide-react";

export default function Signup() {
  const t = useTranslations('Session.signup');
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Estados
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de validación visual
  const [passValid, setPassValid] = useState<boolean | null>(null); // null = sin escribir, true = ok, false = error
  const [passMatch, setPassMatch] = useState<boolean | null>(null);

  // Validación en tiempo real (Mejor que querySelector)
  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassValid(e.target.value.length >= 8);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Necesitamos el valor del primer password. 
    // Nota: Para simplificar sin usar refs, asumimos validación al submit o usamos form data al final.
    // Pero para feedback visual rápido:
    const passInput = (document.getElementById('password-input') as HTMLInputElement)?.value;
    setPassMatch(e.target.value === passInput);
  };

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const passwordConfirmation = formData.get('passwordConfirmation') as string;

    // Validaciones finales
    if (password.length < 8) {
        setError(t('errorLength'));
        setIsLoading(false);
        return;
    }
    if (password !== passwordConfirmation) {
        setError(t('errorMatch'));
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch(apiEndPoints.signup, {
        method: "POST",
        body: formData, // Enviamos FormData directo para manejar la imagen
      });

      if (res.ok) {
        const data = await res.json();
        
        // Login automático tras registro exitoso
        dispatch(signIn(data));
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        router.push('/products');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error en registro');
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }

  // Clases CSS reutilizables para inputs
  const inputClass = "w-full bg-transparent border-b border-mokaze-dark/20 py-2 text-mokaze-primary placeholder-mokaze-dark/40 focus:outline-none focus:border-mokaze-accent transition-colors duration-300 text-sm";
  const errorInputClass = "w-full bg-red-50/50 border-b border-red-400 py-2 text-red-900 placeholder-red-300 focus:outline-none text-sm";

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif text-mokaze-primary font-bold">{t('title')}</h1>
        <p className="text-mokaze-dark/60 text-xs tracking-wider uppercase mt-1">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form className="space-y-4" encType="multipart/form-data" onSubmit={handleSignup}>
        
        {/* Grid para nombres */}
        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" type="text" placeholder={t('firstName')} className={inputClass} required />
          <input name="lastName" type="text" placeholder={t('lastName')} className={inputClass} required />
        </div>

        <input name="username" type="text" placeholder={t('username')} className={inputClass} required />
        <input name="email" type="email" placeholder={t('email')} className={inputClass} required />
        <input name="contactNumber" type="text" placeholder={t('contact')} className={inputClass} />

        {/* Passwords con Feedback Visual */}
        <div className="relative">
             <input 
                id="password-input"
                name="password" 
                type="password" 
                placeholder={t('password')} 
                className={passValid === false ? errorInputClass : inputClass} 
                onChange={handlePassChange}
                required 
            />
        </div>
        
        <input 
            name="passwordConfirmation" 
            type="password" 
            placeholder={t('confirmPassword')} 
            className={passMatch === false ? errorInputClass : inputClass}
            onChange={handleConfirmChange}
            required 
        />

        {/* File Upload Estilizado */}
        <label className="flex items-center gap-3 cursor-pointer group py-2">
            <div className="w-10 h-10 rounded-full bg-mokaze-sand flex items-center justify-center group-hover:bg-mokaze-accent transition-colors">
                <Upload className="w-4 h-4 text-mokaze-dark group-hover:text-white" />
            </div>
            <span className="text-sm text-mokaze-dark/60 group-hover:text-mokaze-primary transition-colors">
                {t('uploadImage')}
            </span>
            <input name="profileImage" type="file" className="hidden" accept="image/*" />
        </label>

        {/* Lógica Admin */}
        <input name="role" type="hidden" value={isAdminMode ? 'admin' : 'user'} />
        
        {isAdminMode && (
           <div className="animate-fade-in bg-orange-50 p-3 rounded-sm border border-orange-100">
             <div className="flex items-center gap-2 text-orange-800 text-xs mb-1">
                <ShieldAlert className="w-3 h-3"/> Zona Administrativa
             </div>
             <input name="adminPassword" type="password" placeholder={t('adminPass')} className="w-full bg-white border border-orange-200 px-2 py-1 text-sm rounded-sm focus:outline-none focus:border-orange-500" />
           </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-mokaze-primary text-white py-3 mt-6 tracking-widest uppercase text-xs font-bold hover:bg-mokaze-accent transition-all duration-300 shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
          {t('submit')}
        </button>
      </form>

      {/* Toggle Admin discreto */}
      <button 
        onClick={() => setIsAdminMode(!isAdminMode)} 
        className="w-full mt-4 text-[10px] text-mokaze-dark/30 hover:text-mokaze-accent uppercase tracking-widest transition-colors"
      >
        {isAdminMode ? t('switchUser') : t('switchAdmin')}
      </button>
    </div>
  );
}