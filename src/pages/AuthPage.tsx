import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        toast.success('Welcome back!');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success('Account created! You can now log in.');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Try logging in instead.');
      } else if (error.message?.includes('Invalid login')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      <header className="px-6 pt-8 pb-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
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
          {isLogin ? 'Welcome Back' : 'Join SteadySteps'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-center mb-8"
        >
          {isLogin 
            ? 'Continue your wellness journey'
            : 'Start building healthier habits today'
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
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
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
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </motion.form>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin 
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'
          }
        </motion.button>
      </div>
    </div>
  );
};
