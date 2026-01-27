import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const referralCode = searchParams.get('ref');

  // If there's a referral code, default to signup mode
  useEffect(() => {
    if (referralCode) {
      setIsLogin(false);
    }
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(language === 'en' ? 'Welcome back!' : '¡Bienvenida de nuevo!');
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;

        // If there's a referral code, create the referral record
        if (referralCode && data.user) {
          try {
            await supabase.functions.invoke('process-referral', {
              body: {
                referralCode,
                referredEmail: email,
                referredUserId: data.user.id,
                eventType: 'signup',
              },
            });
          } catch (refError) {
            console.error('Error processing referral:', refError);
            // Don't fail signup if referral processing fails
          }
        }

        toast.success(language === 'en' ? 'Account created! You can now log in.' : '¡Cuenta creada! Ahora puedes iniciar sesión.');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message?.includes('already registered')) {
        toast.error(language === 'en' 
          ? 'This email is already registered. Try logging in instead.'
          : 'Este correo ya está registrado. Intenta iniciar sesión.'
        );
      } else if (error.message?.includes('Invalid login')) {
        toast.error(language === 'en' 
          ? 'Invalid email or password. Please try again.'
          : 'Correo o contraseña inválidos. Intenta de nuevo.'
        );
      } else {
        toast.error(error.message || (language === 'en' ? 'Something went wrong' : 'Algo salió mal'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const texts = {
    en: {
      welcomeBack: 'Welcome Back',
      joinTitle: 'Join SteadySteps',
      referralTitle: "You've Been Invited!",
      continueJourney: 'Continue your wellness journey',
      startHabits: 'Start building healthier habits today',
      referralSubtitle: 'A friend invited you to join SteadySteps',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      pleaseWait: 'Please wait...',
      noAccount: "Don't have an account? Sign up",
      hasAccount: 'Already have an account? Sign in',
      back: 'Back',
    },
    es: {
      welcomeBack: 'Bienvenida de Nuevo',
      joinTitle: 'Únete a SteadySteps',
      referralTitle: '¡Has Sido Invitada!',
      continueJourney: 'Continúa tu camino de bienestar',
      startHabits: 'Empieza a crear hábitos más saludables hoy',
      referralSubtitle: 'Una amiga te invitó a unirte a SteadySteps',
      email: 'Correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      createAccount: 'Crear Cuenta',
      pleaseWait: 'Por favor espera...',
      noAccount: '¿No tienes cuenta? Regístrate',
      hasAccount: '¿Ya tienes cuenta? Inicia sesión',
      back: 'Atrás',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      <header className="px-6 pt-8 pb-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-8"
        >
          <Heart className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-heading font-bold mb-2 text-center"
        >
          {isLogin ? t.welcomeBack : referralCode ? t.referralTitle : t.joinTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-center mb-8"
        >
          {isLogin 
            ? t.continueJourney
            : referralCode ? t.referralSubtitle : t.startHabits
          }
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full py-6 text-lg font-semibold"
          >
            {isLoading ? t.pleaseWait : isLogin ? t.signIn : t.createAccount}
          </Button>
        </motion.form>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? t.noAccount : t.hasAccount}
        </motion.button>
      </div>
    </div>
  );
};
