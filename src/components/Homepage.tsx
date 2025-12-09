'use client';

import { useAppSelector } from '@/lib/hooks';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Homepage() {
  const { homeSections } = useAppSelector((state) => state.homeSections);
  // Inicializamos el hook apuntando al namespace 'Home'
  const t = useTranslations('Home');

  // URL base para imágenes
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES || '';

  return (
    <div className="w-full bg-mokaze-base overflow-hidden">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="relative h-[85vh] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-stone-800 relative">
             <Image 
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2500&auto=format&fit=crop" 
                alt={t('hero.alt')}
                fill
                className="object-cover opacity-60 mix-blend-overlay"
                priority
             />
             <div className="absolute inset-0 bg-gradient-to-t from-mokaze-base via-transparent to-black/30" />
          </div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <p className="text-mokaze-sand/90 tracking-[0.3em] text-xs md:text-sm font-semibold mb-6 uppercase">
            {t('hero.subtitle')}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-lg">
            {t('hero.title')}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {t('hero.description')}
          </p>
          
          <Link 
            href="/products" 
            className="group inline-flex items-center gap-3 bg-mokaze-accent text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-mokaze-primary transition-all duration-300 ease-out shadow-lg hover:shadow-xl rounded-sm"
          >
            {t('hero.cta')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>


      {/* --- 2. DYNAMIC SECTIONS --- */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-32">
        {homeSections.map((section, index) => {
          const isEven = index % 2 === 0;

          return (
            <div 
              key={section._id} 
              className={`flex flex-col md:flex-row gap-12 md:gap-24 items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}
            >
              
              {/* Columna Imagen */}
              <div className="w-full md:w-1/2 relative group">
                <div className="aspect-[4/5] relative overflow-hidden rounded-sm shadow-xl">
                  <div className="absolute inset-0 border border-white/20 z-10 m-4 pointer-events-none opacity-50"></div>
                  
                  <Image
                    src={`${imageBaseUrl}${section.image}`}
                    // Si el título viene vacío, usamos un fallback traducido
                    alt={section.title || t('sections.defaultAlt')}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-mokaze-primary/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                
                <div className={`absolute -bottom-4 -right-4 w-full h-full border border-mokaze-primary/10 -z-10 rounded-sm ${!isEven ? '-left-4' : ''}`}></div>
              </div>

              {/* Columna Texto */}
              <div className="w-full md:w-1/2 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <span className="h-[1px] w-12 bg-mokaze-accent"></span>
                   <span className="text-mokaze-accent text-xs tracking-widest uppercase">
                     {t('sections.chapter')} 0{index + 1}
                   </span>
                </div>
                
                {/* Nota: section.title viene de la base de datos, ese se mantiene dinámico */}
                <h3 className="text-3xl md:text-4xl font-serif text-mokaze-primary font-medium leading-tight">
                  {section.title}
                </h3>
                
                <div className="space-y-4 text-mokaze-dark/70 text-lg leading-relaxed font-light">
                  {section.paragraphs && section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>

                <div className="pt-4">
                  <Link href="/products" className="text-sm border-b border-mokaze-dark/30 pb-1 hover:border-mokaze-accent hover:text-mokaze-accent transition-colors tracking-widest uppercase">
                    {t('sections.readMore')}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* --- 3. SECCIÓN NEWSLETTER --- */}
      <section className="py-20 bg-mokaze-primary text-mokaze-base text-center px-6">
        <h2 className="font-serif text-3xl mb-6">{t('newsletter.title')}</h2>
        <p className="mb-8 opacity-70 max-w-md mx-auto">{t('newsletter.description')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
           <input 
             type="email" 
             placeholder={t('newsletter.placeholder')} 
             className="px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-mokaze-accent rounded-sm w-full" 
           />
           <button className="bg-mokaze-accent text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-mokaze-primary transition-colors rounded-sm">
             {t('newsletter.button')}
           </button>
        </div>
      </section>

    </div>
  );
}