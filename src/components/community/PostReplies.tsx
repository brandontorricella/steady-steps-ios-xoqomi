import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getRandomAnonymousName } from './CommunityFeed';

interface Reply {
  id: string;
  content: string;
  anonymous_name: string;
  created_at: string;
  user_id: string;
}

interface PostRepliesProps {
  postId: string;
}

export const PostReplies = ({ postId }: PostRepliesProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from('community_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error) setReplies((data as Reply[]) || []);
    setLoading(false);
  };

  const handleSubmitReply = async () => {
    if (!user || !replyText.trim()) return;
    setSubmitting(true);

    try {
      // Moderate
      const { data: modResult } = await supabase.functions.invoke('moderate-post', {
        body: { content: replyText.trim() },
      });

      if (!modResult?.approved) {
        toast.error(modResult?.reason || 'Reply not approved');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('community_replies').insert({
        user_id: user.id,
        post_id: postId,
        content: replyText.trim(),
        anonymous_name: getRandomAnonymousName(),
      });

      if (error) throw error;

      setReplyText('');
      fetchReplies();
      toast.success(language === 'en' ? 'Reply posted! 💚' : '¡Respuesta publicada! 💚');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(language === 'en' ? 'Failed to post reply' : 'Error al publicar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 pt-3 border-t border-border"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />
      ) : (
        <>
          {replies.length > 0 && (
            <div className="space-y-2 mb-3">
              {replies.map(reply => (
                <div key={reply.id} className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{reply.anonymous_name}</span>
                    {reply.user_id === user?.id && (
                      <button
                        onClick={async () => {
                          await supabase.from('community_replies').delete().eq('id', reply.id);
                          fetchReplies();
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        {language === 'en' ? 'Delete' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={language === 'en' ? 'Write a supportive reply...' : 'Escribe una respuesta de apoyo...'}
              maxLength={300}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitReply()}
            />
            <Button
              size="icon"
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || submitting}
              className="rounded-xl"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
};
