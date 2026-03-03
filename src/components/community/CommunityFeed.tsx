import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ComposePostModal } from './ComposePostModal';
import { PostReplies } from './PostReplies';

interface Post {
  id: string;
  content: string;
  anonymous_name: string;
  category: string;
  hearts_count: number;
  replies_count: number;
  created_at: string;
  user_id: string;
}

const ANONYMOUS_NAMES = [
  '🌿 Quiet Walker', '🌸 Gentle Spirit', '🌊 Calm Wave', '☀️ Morning Light',
  '🌙 Night Owl', '🍃 Fresh Start', '🌻 Sunshine', '🦋 New Wings',
  '⭐ Bright Star', '🌈 Rainbow', '🔥 Steady Flame', '💧 Still Water',
  '🌾 Growing Seed', '🕊️ Peaceful One', '🌺 Blooming',
];

const CATEGORIES = [
  { id: 'all', label: { en: 'All', es: 'Todo' } },
  { id: 'win', label: { en: '🎉 Wins', es: '🎉 Logros' } },
  { id: 'struggle', label: { en: '💪 Struggles', es: '💪 Retos' } },
  { id: 'tip', label: { en: '💡 Tips', es: '💡 Consejos' } },
  { id: 'motivation', label: { en: '🔥 Motivation', es: '🔥 Motivación' } },
];

export const getRandomAnonymousName = () => {
  return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
};

const timeAgo = (dateStr: string, lang: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return lang === 'en' ? 'just now' : 'ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

export const CommunityFeed = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCompose, setShowCompose] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts((data as Post[]) || []);

      // Fetch user's reactions
      if (user) {
        const { data: reactions } = await supabase
          .from('community_reactions')
          .select('post_id')
          .eq('user_id', user.id);
        
        setUserReactions(new Set(reactions?.map(r => r.post_id) || []));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleHeart = async (postId: string) => {
    if (!user) return;

    const hasReacted = userReactions.has(postId);

    try {
      if (hasReacted) {
        await supabase
          .from('community_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        setUserReactions(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, hearts_count: p.hearts_count - 1 } : p));
      } else {
        await supabase
          .from('community_reactions')
          .insert({ user_id: user.id, post_id: postId });

        setUserReactions(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, hearts_count: p.hearts_count + 1 } : p));
      }
    } catch (error) {
      console.error('Error toggling heart:', error);
    }
  };

  const handlePostCreated = () => {
    setShowCompose(false);
    fetchPosts();
  };

  const texts = {
    en: {
      title: 'Community Feed',
      subtitle: 'Anonymous & supportive',
      empty: 'No posts yet. Be the first to share!',
      compose: 'Share something',
      hearts: 'hearts',
      replies: 'replies',
    },
    es: {
      title: 'Feed de Comunidad',
      subtitle: 'Anónimo y de apoyo',
      empty: 'No hay publicaciones aún. ¡Sé la primera en compartir!',
      compose: 'Comparte algo',
      hearts: 'corazones',
      replies: 'respuestas',
    },
  };
  const t = texts[language];

  return (
    <div className="space-y-4">
      {/* Header with compose */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4 mr-1" />
            {t.compose}
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label[language]}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {posts.map((post, i) => {
              const isOwn = post.user_id === user?.id;
              const hasHearted = userReactions.has(post.id);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl border-2 border-border bg-card"
                >
                  {/* Post header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{post.anonymous_name}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(post.created_at, language)}</span>
                  </div>

                  {/* Category badge */}
                  {post.category !== 'general' && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground mb-2">
                      {CATEGORIES.find(c => c.id === post.category)?.label[language] || post.category}
                    </span>
                  )}

                  {/* Content */}
                  <p className="text-sm leading-relaxed mb-3">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleHeart(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        hasHearted ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasHearted ? 'fill-current' : ''}`} />
                      <span>{post.hearts_count}</span>
                    </button>

                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies_count}</span>
                    </button>

                    {isOwn && (
                      <button
                        onClick={async () => {
                          await supabase.from('community_posts').delete().eq('id', post.id);
                          setPosts(prev => prev.filter(p => p.id !== post.id));
                          toast.success(language === 'en' ? 'Post deleted' : 'Publicación eliminada');
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive ml-auto transition-colors"
                      >
                        {language === 'en' ? 'Delete' : 'Eliminar'}
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  {expandedPost === post.id && (
                    <PostReplies postId={post.id} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <ComposePostModal
          onClose={() => setShowCompose(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
};
