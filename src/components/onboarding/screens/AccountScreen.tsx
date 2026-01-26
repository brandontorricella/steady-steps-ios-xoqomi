import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AccountScreenProps {
  onNext: () => void;
  email: string;
  onEmailChange: (email: string) => void;
}

export const AccountScreen = ({ onNext, email, onEmailChange }: AccountScreenProps) => {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (strength >= 3) return 'strong';
    if (strength >= 2) return 'medium';
    return 'weak';
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!validateEmail(email)) {
      newErrors.email = t('account.invalidEmail');
    }
    if (password.length < 8) {
      newErrors.password = t('account.passwordMinLength');
    }
    if (password !== confirmPassword) {
      newErrors.confirm = t('account.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message?.includes('already registered')) {
          toast.error('An account with this email already exists.');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
        return;
      }
      toast.success('Account created successfully!');
      onNext();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const canSubmit = email && password.length >= 8 && password === confirmPassword;

  return (
    <div className="flex-1 flex flex-col px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('account.createTitle')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center mb-8"
      >
        {t('account.createSubtitle')}
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-4 max-w-sm mx-auto w-full"
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('account.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={t('account.emailPlaceholder')}
              className="pl-10"
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t('account.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('account.passwordPlaceholder')}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passwordStrength === 'weak' ? 'w-1/3 bg-destructive' :
                    passwordStrength === 'medium' ? 'w-2/3 bg-warning' :
                    'w-full bg-success'
                  }`}
                />
              </div>
              <span className={`text-xs capitalize ${
                passwordStrength === 'weak' ? 'text-destructive' :
                passwordStrength === 'medium' ? 'text-warning' :
                'text-success'
              }`}>
                {passwordStrength}
              </span>
            </div>
          )}
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('account.confirmPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('account.confirmPasswordPlaceholder')}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit || isLoading}
          className="w-full py-6 text-lg font-semibold mt-6"
        >
          {isLoading ? t('common.loading') : t('common.continue')}
        </Button>
      </motion.form>
    </div>
  );
};
