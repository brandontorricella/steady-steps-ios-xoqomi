import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getRandomAnonymousName } from './CommunityFeed';

interface ComposePostModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES = [
  { id: 'win', label: { en: '🎉 Win', es: '🎉 Logro' } },
  { id: 'struggle', label: { en: '💪 Struggle', es: '💪 Reto' } },
  { id: 'tip', label: { en: '💡 Tip', es: '💡 Consejo' } },
  { id: 'motivation', label: { en: '🔥 Motivation', es: '🔥 Motivación' } },
];

export const ComposePostModal = ({ onClose, onCreated }: ComposePostModalProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('win');
  const [submitting, setSubmitting] = useState(false);
  const anonymousName = useState(getRandomAnonymousName)[0];

  const texts = {
    en: {
      title: 'Share with the Community',
      placeholder: 'Share a win, struggle, tip, or words of encouragement...',
      category: 'Category',
      posting: 'Posting as',
      privacy: 'Your identity stays completely anonymous',
      post: 'Post',
      posting2: 'Posting...',
    },
    es: {
      title: 'Comparte con la Comunidad',
      placeholder: 'Comparte un logro, reto, consejo o palabras de ánimo...',
      category: 'Categoría',
      posting: 'Publicando como',
      privacy: 'Tu identidad es completamente anónima',
      post: 'Publicar',
      posting2: 'Publicando...',
    },
  };
  const t = texts[language];

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    setSubmitting(true);

    try {
      // Moderate content
      const { data: modResult, error: modError } = await supabase.functions.invoke('moderate-post', {
        body: { content: content.trim() },
      });

      if (modError) throw modError;

      if (!modResult.approved) {
        toast.error(modResult.reason || (language === 'en' ? 'Post not approved' : 'Publicación no aprobada'));
        setSubmitting(false);
        return;
      }

      // Create post
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        content: content.trim(),
        anonymous_name: anonymousName,
        category,
      });

      if (error) throw error;

      toast.success(language === 'en' ? 'Posted! 💚' : '¡Publicado! 💚');
      onCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(language === 'en' ? 'Failed to post. Try again.' : 'Error al publicar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold">{t.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anonymous identity */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-secondary/50">
          <Shield className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-medium">{t.posting}: <span className="text-primary">{anonymousName}</span></p>
            <p className="text-xs text-muted-foreground">{t.privacy}</p>
          </div>
        </div>

        {/* Category */}
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                category === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {cat.label[language]}
            </button>
          ))}
        </div>

        {/* Content */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t.placeholder}
          maxLength={500}
          rows={4}
          className="w-full p-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors"
          autoFocus
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{content.length}/500</p>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="w-full mt-4"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.posting2}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t.post}
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
