import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

interface HiddenCalorieTip {
  id: string;
  title: { en: string; es: string };
  why: { en: string; es: string };
  swap: { en: string; es: string };
  icon: string;
}

const HIDDEN_CALORIE_TIPS: HiddenCalorieTip[] = [
  {
    id: 'avocado',
    title: { en: 'Large Avocado Portions', es: 'Porciones Grandes de Aguacate' },
    why: { 
      en: 'Avocados are incredibly nutritious but calorie-dense. A whole avocado can have 320+ calories. Easy to eat more than you realize.',
      es: 'Los aguacates son muy nutritivos pero densos en calorías. Un aguacate entero puede tener más de 320 calorías.'
    },
    swap: { 
      en: 'Try using 1/4 to 1/3 of an avocado per serving. You still get the healthy fats and flavor!',
      es: 'Intenta usar 1/4 a 1/3 de aguacate por porción. ¡Aún obtienes las grasas saludables y el sabor!'
    },
    icon: '🥑'
  },
  {
    id: 'coffee',
    title: { en: 'Coffee Creamers & Sweeteners', es: 'Cremas y Endulzantes de Café' },
    why: { 
      en: 'That daily latte or flavored creamer adds up fast. A tablespoon of creamer can be 35-50 calories, and coffee shop drinks can hit 400+.',
      es: 'Ese latte diario o crema saborizada suma rápido. Una cucharada de crema puede ser 35-50 calorías.'
    },
    swap: { 
      en: 'Try unsweetened almond milk, a splash of oat milk, or gradually reduce sugar. Small changes, big impact over time.',
      es: 'Prueba leche de almendra sin azúcar o reduce gradualmente el azúcar. Pequeños cambios, gran impacto.'
    },
    icon: '☕'
  },
  {
    id: 'juices',
    title: { en: 'Juices & Smoothies', es: 'Jugos y Smoothies' },
    why: { 
      en: 'Even "healthy" juices and smoothies can pack 200-500 calories. Liquid calories don\'t fill you up like solid food.',
      es: 'Incluso jugos y smoothies "saludables" pueden tener 200-500 calorías. Las calorías líquidas no te llenan como la comida sólida.'
    },
    swap: { 
      en: 'Eat whole fruits instead—the fiber helps you feel full. If you love smoothies, use more veggies and less fruit.',
      es: 'Come frutas enteras—la fibra te ayuda a sentirte llena. Si amas los smoothies, usa más verduras y menos fruta.'
    },
    icon: '🥤'
  },
  {
    id: 'oils',
    title: { en: 'Cooking Oils', es: 'Aceites de Cocina' },
    why: { 
      en: 'One tablespoon of oil = 120 calories. When cooking, it\'s easy to use 2-3 tablespoons without measuring.',
      es: 'Una cucharada de aceite = 120 calorías. Al cocinar, es fácil usar 2-3 cucharadas sin medir.'
    },
    swap: { 
      en: 'Use an oil spray, measure with a teaspoon, or try cooking with broth. Air fryers are also great!',
      es: 'Usa un spray de aceite, mide con cucharadita, o cocina con caldo. ¡Las freidoras de aire son geniales!'
    },
    icon: '🫒'
  },
  {
    id: 'dressings',
    title: { en: 'Salad Dressings', es: 'Aderezos para Ensalada' },
    why: { 
      en: 'That healthy salad can become calorie-heavy with creamy dressings. Ranch and Caesar can add 150-200 calories per serving.',
      es: 'Esa ensalada saludable puede volverse pesada con aderezos cremosos. Ranch y César pueden agregar 150-200 calorías por porción.'
    },
    swap: { 
      en: 'Try balsamic vinegar, lemon juice with herbs, or salsa. Dip your fork instead of pouring.',
      es: 'Prueba vinagre balsámico, jugo de limón con hierbas, o salsa. Moja tu tenedor en lugar de verter.'
    },
    icon: '🥗'
  },
  {
    id: 'condiments',
    title: { en: 'Sauces & Condiments', es: 'Salsas y Condimentos' },
    why: { 
      en: 'Ketchup, BBQ sauce, mayo, and honey all add hidden sugars and fats. A few tablespoons can add 100+ calories.',
      es: 'Ketchup, salsa BBQ, mayonesa y miel agregan azúcares y grasas ocultas. Unas cucharadas pueden agregar 100+ calorías.'
    },
    swap: { 
      en: 'Use mustard, hot sauce, or fresh salsa instead. When using mayo, try light versions or Greek yogurt.',
      es: 'Usa mostaza, salsa picante o salsa fresca. Con la mayonesa, prueba versiones light o yogur griego.'
    },
    icon: '🍯'
  },
  {
    id: 'snacks',
    title: { en: 'Small Snacks That Add Up', es: 'Snacks Pequeños que Suman' },
    why: { 
      en: 'A few nuts here, some crackers there, a piece of chocolate... These "small bites" can easily add 300-500 untracked calories.',
      es: 'Unas nueces aquí, unas galletas allá, un chocolate... Estos "pequeños bocados" pueden agregar 300-500 calorías no registradas.'
    },
    swap: { 
      en: 'Pre-portion your snacks. Use small bowls instead of eating from the bag. Awareness is key!',
      es: 'Pre-porciona tus snacks. Usa platos pequeños en lugar de comer de la bolsa. ¡La conciencia es clave!'
    },
    icon: '🥜'
  },
  {
    id: 'cooking-bites',
    title: { en: 'Bites While Cooking', es: 'Probaditas al Cocinar' },
    why: { 
      en: 'Tasting while cooking, nibbling ingredients, licking spoons... These add up and are rarely tracked.',
      es: 'Probar mientras cocinas, picar ingredientes, lamer cucharas... Esto suma y raramente se registra.'
    },
    swap: { 
      en: 'Chew gum while cooking, or have a low-cal drink. If you must taste, use a tiny spoon!',
      es: 'Mastica chicle mientras cocinas, o toma una bebida baja en calorías. Si debes probar, ¡usa una cuchara pequeña!'
    },
    icon: '👩‍🍳'
  },
  {
    id: 'healthy-portions',
    title: { en: '"Healthy" Foods in Large Portions', es: 'Alimentos "Saludables" en Porciones Grandes' },
    why: { 
      en: 'Nuts, nut butters, granola, dried fruit, dark chocolate—all healthy, but portion matters. A cup of granola can be 500+ calories.',
      es: 'Nueces, mantequillas, granola, fruta seca, chocolate oscuro—todos saludables, pero la porción importa.'
    },
    swap: { 
      en: 'Check serving sizes. Use measuring cups until you train your eye. A little goes a long way!',
      es: 'Revisa las porciones. Usa tazas medidoras hasta entrenar tu ojo. ¡Un poco rinde mucho!'
    },
    icon: '🍫'
  },
  {
    id: 'alcohol',
    title: { en: 'Alcoholic Beverages', es: 'Bebidas Alcohólicas' },
    why: { 
      en: 'Wine, beer, and cocktails add empty calories fast. A glass of wine is ~125 calories, a margarita can be 300+.',
      es: 'Vino, cerveza y cocteles agregan calorías vacías rápido. Una copa de vino es ~125 calorías, una margarita puede ser 300+.'
    },
    swap: { 
      en: 'Try sparkling water with lime, or alternate alcoholic drinks with water. Choose light beer or wine spritzers.',
      es: 'Prueba agua con gas y limón, o alterna bebidas alcohólicas con agua. Elige cerveza light o vino con agua.'
    },
    icon: '🍷'
  }
];

export const HiddenCaloriesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const texts = {
    en: {
      title: 'Hidden Calories',
      subtitle: 'Small changes that make a big difference',
      intro: 'These sneaky calories often go unnoticed. Understanding them helps you make informed choices—no perfection required, just awareness!',
      whySneaky: 'Why it\'s sneaky',
      easySwap: 'Easy swap',
      remember: 'Remember: Small changes add up to big results. You don\'t have to be perfect—just a little more aware. 💪'
    },
    es: {
      title: 'Calorías Ocultas',
      subtitle: 'Pequeños cambios que hacen una gran diferencia',
      intro: 'Estas calorías sigilosas a menudo pasan desapercibidas. Entenderlas te ayuda a tomar decisiones informadas—¡no se requiere perfección, solo conciencia!',
      whySneaky: 'Por qué es sigiloso',
      easySwap: 'Cambio fácil',
      remember: 'Recuerda: Los pequeños cambios suman grandes resultados. No tienes que ser perfecta—solo un poco más consciente. 💪'
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <div className="flex gap-3">
            <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">{t.intro}</p>
          </div>
        </motion.div>

        {/* Tips List */}
        <div className="space-y-4">
          {HIDDEN_CALORIE_TIPS.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-2xl border-2 border-border bg-card"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{tip.icon}</span>
                <div className="flex-1 space-y-3">
                  <h3 className="font-heading font-semibold text-lg">{tip.title[language]}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">{t.whySneaky}</p>
                        <p className="text-sm text-muted-foreground mt-1">{tip.why[language]}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-success uppercase tracking-wide">{t.easySwap}</p>
                        <p className="text-sm text-muted-foreground mt-1">{tip.swap[language]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Encouragement Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl bg-success/10 border border-success/20 text-center"
        >
          <p className="text-sm text-foreground">{t.remember}</p>
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  );
};
