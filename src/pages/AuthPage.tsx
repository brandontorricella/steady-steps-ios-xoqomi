import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset-sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const referralCode = searchParams.get('ref');

  // If there's a referral code, default to signup mode
  useEffect(() => {
    if (referralCode) {
      setMode('signup');
    }
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(language === 'en' ? 'Welcome back!' : '¡Bienvenida de nuevo!');
        navigate('/');
      } else if (mode === 'signup') {
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(language === 'en' ? 'Please enter your email address' : 'Por favor ingresa tu correo electrónico');
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setMode('reset-sent');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || (language === 'en' ? 'Something went wrong' : 'Algo salió mal'));
    } finally {
      setIsLoading(false);
    }
  };

  const texts = {
    en: {
      welcomeBack: 'Welcome Back',
      joinTitle: 'Join SteadySteps',
      referralTitle: "You've Been Invited!",
      forgotTitle: 'Reset Password',
      resetSentTitle: 'Check Your Email',
      continueJourney: 'Continue your wellness journey',
      startHabits: 'Start building healthier habits today',
      referralSubtitle: 'A friend invited you to join SteadySteps',
      forgotSubtitle: 'Enter your email to receive a reset link',
      resetSentSubtitle: 'We sent a password reset link to your email',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      sendResetLink: 'Send Reset Link',
      pleaseWait: 'Please wait...',
      noAccount: "Don't have an account? Sign up",
      hasAccount: 'Already have an account? Sign in',
      forgotPassword: 'Forgot password?',
      backToLogin: 'Back to login',
      back: 'Back',
      checkSpam: 'If you don\'t see it, check your spam folder.',
    },
    es: {
      welcomeBack: 'Bienvenida de Nuevo',
      joinTitle: 'Únete a SteadySteps',
      referralTitle: '¡Has Sido Invitada!',
      forgotTitle: 'Restablecer Contraseña',
      resetSentTitle: 'Revisa Tu Correo',
      continueJourney: 'Continúa tu camino de bienestar',
      startHabits: 'Empieza a crear hábitos más saludables hoy',
      referralSubtitle: 'Una amiga te invitó a unirte a SteadySteps',
      forgotSubtitle: 'Ingresa tu correo para recibir un enlace de restablecimiento',
      resetSentSubtitle: 'Enviamos un enlace de restablecimiento a tu correo',
      email: 'Correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      createAccount: 'Crear Cuenta',
      sendResetLink: 'Enviar Enlace',
      pleaseWait: 'Por favor espera...',
      noAccount: '¿No tienes cuenta? Regístrate',
      hasAccount: '¿Ya tienes cuenta? Inicia sesión',
      forgotPassword: '¿Olvidaste tu contraseña?',
      backToLogin: 'Volver al inicio de sesión',
      back: 'Atrás',
      checkSpam: 'Si no lo ves, revisa tu carpeta de spam.',
    },
  };

  const t = texts[language];

  const getTitle = () => {
    switch (mode) {
      case 'login': return t.welcomeBack;
      case 'signup': return referralCode ? t.referralTitle : t.joinTitle;
      case 'forgot': return t.forgotTitle;
      case 'reset-sent': return t.resetSentTitle;
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return t.continueJourney;
      case 'signup': return referralCode ? t.referralSubtitle : t.startHabits;
      case 'forgot': return t.forgotSubtitle;
      case 'reset-sent': return t.resetSentSubtitle;
    }
  };

  // Reset sent confirmation screen
  if (mode === 'reset-sent') {
    return (
      <div className="min-h-screen gradient-soft flex flex-col">
        <header className="px-6 pt-8 pb-4">
          <button 
            onClick={() => setMode('login')}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backToLogin}</span>
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
          >
            <CheckCircle className="w-10 h-10 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-heading font-bold mb-2 text-center"
          >
            {t.resetSentTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-center mb-4"
          >
            {t.resetSentSubtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground text-center mb-8"
          >
            {t.checkSpam}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button onClick={() => setMode('login')} variant="outline">
              {t.backToLogin}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      <header className="px-6 pt-8 pb-4">
        <button 
          onClick={() => mode === 'forgot' ? setMode('login') : navigate('/')}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{mode === 'forgot' ? t.backToLogin : t.back}</span>
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
          {getTitle()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-center mb-8"
        >
          {getSubtitle()}
        </motion.p>

        {mode === 'forgot' ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleForgotPassword}
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

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full py-6 text-lg font-semibold"
            >
              {isLoading ? t.pleaseWait : t.sendResetLink}
            </Button>
          </motion.form>
        ) : (
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

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-primary hover:underline"
              >
                {t.forgotPassword}
              </button>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full py-6 text-lg font-semibold"
            >
              {isLoading ? t.pleaseWait : mode === 'login' ? t.signIn : t.createAccount}
            </Button>
          </motion.form>
        )}

        {mode !== 'forgot' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === 'login' ? t.noAccount : t.hasAccount}
          </motion.button>
        )}
      </div>
    </div>
  );
};
