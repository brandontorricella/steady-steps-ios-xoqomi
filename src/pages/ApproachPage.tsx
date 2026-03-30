import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Sprout, ArrowLeft } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const SectionDivider = () => (
  <div className="flex items-center gap-4 py-6">
    <div className="flex-1 h-px bg-border" />
    <Sprout className="w-4 h-4 text-primary/40" />
    <div className="flex-1 h-px bg-border" />
  </div>
);

const ApproachPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">The 5-Minute Approach</h1>
            <p className="text-xs text-muted-foreground">Why we start small and build from there</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-2">

        {/* Section 1 */}
        <motion.section {...fadeIn}>
          <h2 className="text-lg font-bold text-foreground mb-3">You've Been Lied To</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Every fitness app tells you the same thing:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 pl-1">
            <li>• 30-60 minute workouts, 5-6 days a week</li>
            <li>• Strict meal plans</li>
            <li>• Track everything</li>
            <li>• Push through the pain</li>
            <li>• No excuses</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            And you've tried. You download the app. Day 1 is great. Day 2 is hard. Day 3... life happens. You miss it. Feel guilty. By week 2, you've quit.
          </p>
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground">
              But here's the truth: <span className="text-primary">You didn't fail. The approach failed you.</span>
            </p>
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 2 */}
        <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-bold text-foreground mb-3">The "All or Nothing" Trap</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Traditional fitness apps assume motivation lasts. It doesn't.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Motivation gets you to Day 1. <strong className="text-foreground">Habits get you to Day 100.</strong>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            But you can't build habits when the bar is set at 60 minutes.
          </p>
          <p className="text-sm font-medium text-foreground mb-2">When life happens:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 pl-1">
            <li>• Kids get sick</li>
            <li>• Work explodes</li>
            <li>• You're exhausted</li>
            <li>• Your cycle hits</li>
            <li>• You didn't sleep</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            60 minutes becomes impossible. You skip once. Then twice. Then you quit.
          </p>
          <div className="bg-destructive/10 rounded-xl p-4 mb-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">The pattern:</strong> Download → Motivated → Overwhelmed → Quit → Shame
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">
            You're not weak. The system is broken.
          </p>
        </motion.section>

        <SectionDivider />

        {/* Section 3 */}
        <motion.section {...fadeIn} transition={{ delay: 0.15 }}>
          <h2 className="text-lg font-bold text-foreground mb-3">What Actually Works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Here's what behavioral science tells us:
          </p>
          <p className="text-sm font-semibold text-foreground mb-3">Small habits stick. Big habits don't.</p>
          <p className="text-sm text-muted-foreground mb-2">5 minutes is:</p>
          <ul className="text-sm space-y-2 mb-4 pl-1">
            <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-muted-foreground">Short enough you can't talk yourself out of it</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-muted-foreground">Long enough to actually do something</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-muted-foreground">Possible even on your worst days</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-muted-foreground">Sustainable through periods, bad sleep, chaos</span></li>
            <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-muted-foreground">Maintainable for months and years</span></li>
          </ul>
          <div className="bg-primary/10 rounded-xl p-4 mb-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">The secret:</strong> We're not building a workout routine. We're building the <strong className="text-primary">habit of showing up.</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Once showing up is automatic (30-90 days), THEN you increase. Not before.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs text-destructive/80">Most apps: Start big → Burn out → Quit</p>
            <p className="text-xs text-primary font-medium">SteadySteps: Start tiny → Build consistency → Increase gradually → Actually stick</p>
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 4 */}
        <motion.section {...fadeIn} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-foreground mb-3">Your Brain Wants Easy Wins</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Your brain avoids hard things and seeks easy wins.
          </p>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-1">Traditional Approach:</p>
              <p className="text-xs text-muted-foreground">60-min workout = HARD → Brain resists → Willpower needed → Eventually quit</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-foreground mb-1">SteadySteps:</p>
              <p className="text-xs text-muted-foreground">5 minutes = EASY → Brain accepts → No willpower needed → Becomes automatic</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-foreground mb-2">The math:</p>
            <p className="text-sm text-primary font-semibold">5 min × 365 days = 1,825 minutes (30+ hours)</p>
            <p className="text-xs text-muted-foreground mt-1">vs.</p>
            <p className="text-sm text-destructive/70">60 min × 14 days = 840 minutes (then you quit)</p>
          </div>
          <p className="text-sm font-semibold text-foreground mb-2">Consistent beats intense. Every time.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Studies show: People who start with short, easy habits are <strong className="text-primary">3x more likely</strong> to still be doing them 6 months later.
          </p>
        </motion.section>

        <SectionDivider />

        {/* Section 5 */}
        <motion.section {...fadeIn} transition={{ delay: 0.25 }}>
          <h2 className="text-lg font-bold text-foreground mb-3">If 5 Minutes Feels Too Easy...</h2>
          <p className="text-sm text-primary font-semibold mb-3">Good! That's the point.</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            We WANT you to finish and think "I could have done more."
          </p>
          <p className="text-sm font-medium text-foreground mb-3">Here's why:</p>

          <div className="space-y-4 mb-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-2">1. You're building trust with yourself</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you say "I'll do 5 minutes" and do it, you kept your promise. Your brain learns: "I do what I say I'll do."
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                If you say "I'll do 60 minutes" and quit on day 3, your brain learns: "I can't trust myself."
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-2">2. You're avoiding burnout</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ending while you still have energy makes you WANT to come back tomorrow. Pushing to exhaustion makes you dread tomorrow.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-2">3. You're playing the long game</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We're not optimizing for Week 1. We're optimizing for Month 6, Year 2, Year 5.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-xl p-4 mb-3">
            <p className="text-sm font-medium text-foreground mb-2">When you're ready to do more:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              After 30-60 days of consistent 5-minute check-ins, your body and brain will naturally want more. THEN you increase. Gradually. From 5 to 7. Then 10. Then 15. But only when the habit is automatic.
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">
            Trust the process. Start small. Stay consistent. Build forever.
          </p>
        </motion.section>

        <SectionDivider />

        {/* Section 6 */}
        <motion.section {...fadeIn} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-bold text-foreground mb-4">The SteadySteps Timeline</h2>
          <div className="space-y-3">
            {[
              { days: 'Days 1-7', title: 'Building the routine', desc: "You're just showing up. 5 minutes. That's it. No intensity needed." },
              { days: 'Days 8-30', title: 'Creating automaticity', desc: "It's getting easier to remember. You're checking in without thinking about it." },
              { days: 'Days 31-60', title: 'Habit formed', desc: "Showing up is automatic now. You do it without deciding. This is the magic." },
              { days: 'Days 61-90', title: 'Ready to expand', desc: 'Your body naturally wants more. Add 2-3 minutes. Still gentle.' },
              { days: 'Days 91+', title: 'Sustainable forever', desc: "You've built something that lasts. Increase duration if you want. Or don't. Either way, you're winning." },
            ].map((phase, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i <= 1 ? 'bg-muted-foreground/30' : i <= 3 ? 'bg-primary/50' : 'bg-primary'}`} />
                  {i < 4 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-bold text-primary">{phase.days}</p>
                  <p className="text-sm font-semibold text-foreground">{phase.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-primary/10 rounded-xl p-4 mt-2">
            <p className="text-sm font-semibold text-foreground">The goal isn't intensity. It's sustainability.</p>
            <p className="text-xs text-muted-foreground mt-1">You're not training for a marathon. You're training for a lifetime.</p>
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 7 */}
        <motion.section {...fadeIn} transition={{ delay: 0.35 }}>
          <h2 className="text-lg font-bold text-foreground mb-4">Every Other App vs. SteadySteps</h2>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <p className="text-xs font-bold text-foreground mb-2">Other Apps:</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>❌ Start with 60-minute workouts</li>
                <li>❌ Expect perfection</li>
                <li>❌ Punish you for missing days</li>
                <li>❌ Ignore your cycle and hormones</li>
                <li>❌ One-size-fits-all approach</li>
                <li>❌ Designed for motivation (which fades)</li>
              </ul>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-xs font-bold text-foreground mb-2">SteadySteps:</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-1.5"><span className="text-primary">✅</span> Start with 5 minutes</li>
                <li className="flex items-start gap-1.5"><span className="text-primary">✅</span> Celebrate showing up</li>
                <li className="flex items-start gap-1.5"><span className="text-primary">✅</span> Give you grace days when life happens</li>
                <li className="flex items-start gap-1.5"><span className="text-primary">✅</span> Adjust for your menstrual cycle and menopause</li>
                <li className="flex items-start gap-1.5"><span className="text-primary">✅</span> Personalized to your life</li>
                <li className="flex items-start gap-1.5"><span className="text-primary">✅</span> Designed for habit formation (which lasts)</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            <strong className="text-foreground">We're not here to make you feel guilty.</strong>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            We're here to help you build something sustainable. Something that works with your life, not against it. Something you can do during perimenopause, postpartum, burnout, grief, chaos.
          </p>
          <p className="text-sm font-bold text-primary">5 minutes. Every day. Forever.</p>
          <p className="text-sm text-muted-foreground">That's how you change your life.</p>
        </motion.section>

        <SectionDivider />

        {/* Section 8 */}
        <motion.section {...fadeIn} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-bold text-foreground mb-3">You Have Permission</h2>
          <div className="bg-primary/10 rounded-xl p-5 mb-4">
            <p className="text-sm text-muted-foreground mb-3">You have permission to:</p>
            <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Start with 5 minutes (even when you "should" do more)</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Use grace days without guilt</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Do less on hard days</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Rest during your period</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Adjust for menopause symptoms</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Never do a burpee if you hate burpees</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Walk instead of run</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Stretch instead of lift</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span> Just breathe instead of move</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            You have permission to build habits that actually work for your life.
          </p>
          <p className="text-sm font-semibold text-foreground mb-1">This isn't settling. This is sustainable.</p>
          <p className="text-sm text-primary font-bold">You're not weak for starting small. You're smart.</p>
        </motion.section>

        {/* CTA */}
        <div className="pt-8 pb-4">
          <Button onClick={() => navigate('/')} size="lg" className="w-full">
            I'm Ready to Start
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ApproachPage;
