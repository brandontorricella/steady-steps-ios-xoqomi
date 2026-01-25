import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getUserProfile } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { CoachMessage, Stage } from '@/lib/types';

const getSuggestedQuestions = (stage: Stage): string[] => {
  switch (stage) {
    case 'beginner':
      return [
        'What is the easiest way to add more vegetables to my meals?',
        'How can I stay motivated when I do not see results right away?',
        'What counts as gentle movement for my daily goal?',
      ];
    case 'consistent':
      return [
        'How do I push past a weight loss plateau?',
        'What are some healthy snack swaps for my afternoon cravings?',
        'How can I increase my activity without feeling overwhelmed?',
      ];
    case 'confident':
      return [
        'How do I maintain my habits during holidays or travel?',
        'What should I focus on now that I have built consistency?',
        'How can I help a friend start their own health journey?',
      ];
  }
};

export const CoachPage = () => {
  const profile = getUserProfile();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = getSuggestedQuestions(profile?.currentStage || 'beginner');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: CoachMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userContext: profile ? {
            firstName: profile.firstName,
            currentStage: profile.currentStage,
            currentStreak: profile.currentStreak,
            currentActivityGoalMinutes: profile.currentActivityGoalMinutes,
            primaryGoal: profile.primaryGoal,
            primaryNutritionChallenge: profile.primaryNutritionChallenge,
          } : null,
        },
      });

      if (error) throw error;

      const assistantMessage: CoachMessage = {
        role: 'assistant',
        content: data.reply || "I'm here to help! What would you like to know?",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Coach error:', error);
      toast.error('Coach Lily is taking a break. Please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-coral flex items-center justify-center shadow-warm">
            <Heart className="w-7 h-7 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">Coach Lily</h1>
            <p className="text-sm text-muted-foreground">Your personal wellness guide</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <h2 className="text-lg font-heading font-semibold mb-2">
                Ask me anything about fitness or nutrition
              </h2>
              <p className="text-muted-foreground text-sm">
                No question is too simple. I'm here to help!
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Questions to explore today
              </p>
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full p-4 rounded-xl bg-card border border-border text-left hover:border-primary/50 transition-colors"
                >
                  <p className="text-sm">{question}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full gradient-coral flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-card border border-border rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2"
              >
                <div className="w-8 h-8 rounded-full gradient-coral flex items-center justify-center">
                  <Heart className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border rounded-bl-md">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-background border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            disabled={isLoading}
            className="flex-1 bg-card"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <BottomNavigation />
    </div>
  );
};
