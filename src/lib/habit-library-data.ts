// Extended Habit Library with categories, time estimates, difficulty, and icons

export type HabitCategory = 'movement' | 'nourishment' | 'rest' | 'connection' | 'joy' | 'mind' | 'hydration';
export type HabitDifficulty = 'beginner' | 'easy' | 'moderate';

export interface ExtendedHabit {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  category: HabitCategory;
  estimatedMinutes: number;
  difficulty: HabitDifficulty;
  icon: string;
  steps?: string[];
  stepsEs?: string[];
}

export const HABIT_CATEGORIES: { id: HabitCategory; labelEn: string; labelEs: string; icon: string }[] = [
  { id: 'movement', labelEn: 'Movement', labelEs: 'Movimiento', icon: '🏃' },
  { id: 'nourishment', labelEn: 'Nourishment', labelEs: 'Nutrición', icon: '🥗' },
  { id: 'rest', labelEn: 'Rest', labelEs: 'Descanso', icon: '🧘' },
  { id: 'connection', labelEn: 'Connection', labelEs: 'Conexión', icon: '💬' },
  { id: 'joy', labelEn: 'Joy', labelEs: 'Alegría', icon: '🎵' },
  { id: 'mind', labelEn: 'Mind', labelEs: 'Mente', icon: '📖' },
  { id: 'hydration', labelEn: 'Hydration', labelEs: 'Hidratación', icon: '💧' },
];

export const EXTENDED_HABIT_LIBRARY: ExtendedHabit[] = [
  // Movement (10)
  { id: 'morning_stretch', name: '5-Minute Morning Stretch', nameEs: 'Estiramiento Matutino de 5 Min', description: 'Gentle full-body stretch to wake up your muscles', descriptionEs: 'Estiramiento suave para despertar tus músculos', category: 'movement', estimatedMinutes: 5, difficulty: 'beginner', icon: '🌅', steps: ['Stand tall and reach arms overhead', 'Touch your toes gently', 'Roll your shoulders 10 times', 'Twist gently side to side'], stepsEs: ['Párate derecha y estira los brazos', 'Toca tus pies suavemente', 'Rota los hombros 10 veces', 'Gira suavemente de lado a lado'] },
  { id: 'walk_10min', name: '10-Minute Walk', nameEs: 'Caminata de 10 Min', description: 'A short walk around the block or neighborhood', descriptionEs: 'Una caminata corta por el vecindario', category: 'movement', estimatedMinutes: 10, difficulty: 'beginner', icon: '🚶' },
  { id: 'desk_exercises', name: 'Desk Exercises', nameEs: 'Ejercicios de Escritorio', description: 'Simple exercises you can do at your desk', descriptionEs: 'Ejercicios simples que puedes hacer en tu escritorio', category: 'movement', estimatedMinutes: 5, difficulty: 'beginner', icon: '💺' },
  { id: 'dance_song', name: 'Dance to One Song', nameEs: 'Baila Una Canción', description: 'Put on your favorite song and move!', descriptionEs: '¡Pon tu canción favorita y muévete!', category: 'movement', estimatedMinutes: 4, difficulty: 'beginner', icon: '💃' },
  { id: 'stairs_choice', name: 'Take the Stairs', nameEs: 'Usa las Escaleras', description: 'Choose stairs over elevator today', descriptionEs: 'Elige las escaleras en lugar del ascensor', category: 'movement', estimatedMinutes: 2, difficulty: 'beginner', icon: '🪜' },
  { id: 'park_farther', name: 'Park Farther Away', nameEs: 'Estaciona Más Lejos', description: 'Extra steps throughout the day', descriptionEs: 'Pasos extra durante el día', category: 'movement', estimatedMinutes: 5, difficulty: 'beginner', icon: '🅿️' },
  { id: 'yoga_10', name: '10-Minute Gentle Yoga', nameEs: 'Yoga Suave de 10 Min', description: 'Basic yoga poses for flexibility', descriptionEs: 'Posturas básicas de yoga para flexibilidad', category: 'movement', estimatedMinutes: 10, difficulty: 'easy', icon: '🧘‍♀️' },
  { id: 'walk_after_lunch', name: 'Post-Lunch Walk', nameEs: 'Caminata Después del Almuerzo', description: 'A short walk after eating aids digestion', descriptionEs: 'Una caminata corta después de comer ayuda la digestión', category: 'movement', estimatedMinutes: 10, difficulty: 'beginner', icon: '☀️' },
  { id: 'evening_stretch', name: 'Evening Wind-Down Stretch', nameEs: 'Estiramiento Nocturno', description: 'Gentle stretches before bed for better sleep', descriptionEs: 'Estiramientos suaves antes de dormir', category: 'movement', estimatedMinutes: 5, difficulty: 'beginner', icon: '🌙' },
  { id: 'bodyweight_5', name: '5-Min Bodyweight Circuit', nameEs: 'Circuito de 5 Min', description: 'Quick squats, push-ups, and planks', descriptionEs: 'Sentadillas, lagartijas y planchas rápidas', category: 'movement', estimatedMinutes: 5, difficulty: 'moderate', icon: '💪' },

  // Nourishment (10)
  { id: 'extra_veggie', name: 'Add a Vegetable to Lunch', nameEs: 'Agrega un Vegetal al Almuerzo', description: 'Boost your nutrient intake with one extra serving', descriptionEs: 'Aumenta tus nutrientes con una porción extra', category: 'nourishment', estimatedMinutes: 2, difficulty: 'beginner', icon: '🥦' },
  { id: 'fruit_breakfast', name: 'Fruit with Breakfast', nameEs: 'Fruta con el Desayuno', description: 'Start your day with vitamins', descriptionEs: 'Comienza el día con vitaminas', category: 'nourishment', estimatedMinutes: 2, difficulty: 'beginner', icon: '🍎' },
  { id: 'prep_snacks', name: 'Prepare Healthy Snacks', nameEs: 'Prepara Snacks Saludables', description: 'Set yourself up for success', descriptionEs: 'Prepárate para el éxito', category: 'nourishment', estimatedMinutes: 15, difficulty: 'easy', icon: '🥜' },
  { id: 'mindful_meal', name: 'Screen-Free Meal', nameEs: 'Comida Sin Pantallas', description: 'Eat one meal without any screens', descriptionEs: 'Come una comida sin pantallas', category: 'nourishment', estimatedMinutes: 20, difficulty: 'easy', icon: '🍽️' },
  { id: 'new_recipe', name: 'Try a New Healthy Recipe', nameEs: 'Prueba Una Receta Saludable', description: 'Expand your healthy options', descriptionEs: 'Amplía tus opciones saludables', category: 'nourishment', estimatedMinutes: 30, difficulty: 'moderate', icon: '👩‍🍳' },
  { id: 'eat_slowly', name: 'Eat Slowly for One Meal', nameEs: 'Come Despacio una Comida', description: 'Chew thoroughly and savor your food', descriptionEs: 'Mastica bien y disfruta tu comida', category: 'nourishment', estimatedMinutes: 5, difficulty: 'beginner', icon: '🐢' },
  { id: 'portion_check', name: 'Use a Smaller Plate', nameEs: 'Usa un Plato Más Pequeño', description: 'Simple portion control trick', descriptionEs: 'Truco simple de control de porciones', category: 'nourishment', estimatedMinutes: 1, difficulty: 'beginner', icon: '🍽️' },
  { id: 'no_sugary_drink', name: 'Skip Sugary Drinks Today', nameEs: 'Evita Bebidas Azucaradas Hoy', description: 'Choose water or herbal tea instead', descriptionEs: 'Elige agua o té de hierbas', category: 'nourishment', estimatedMinutes: 1, difficulty: 'easy', icon: '🚫' },
  { id: 'protein_breakfast', name: 'Protein with Breakfast', nameEs: 'Proteína con el Desayuno', description: 'Stay full longer with protein in the morning', descriptionEs: 'Siéntete llena más tiempo con proteína', category: 'nourishment', estimatedMinutes: 5, difficulty: 'beginner', icon: '🥚' },
  { id: 'stop_when_full', name: 'Stop When Satisfied', nameEs: 'Para Cuando Estés Satisfecha', description: 'Listen to your body\'s fullness signals', descriptionEs: 'Escucha las señales de tu cuerpo', category: 'nourishment', estimatedMinutes: 1, difficulty: 'easy', icon: '✋' },

  // Rest (8)
  { id: 'deep_breathing', name: '3-Minute Deep Breathing', nameEs: 'Respiración Profunda de 3 Min', description: 'Calm your nervous system with slow breaths', descriptionEs: 'Calma tu sistema nervioso con respiraciones lentas', category: 'rest', estimatedMinutes: 3, difficulty: 'beginner', icon: '🫁' },
  { id: 'body_scan', name: '5-Minute Body Scan', nameEs: 'Escaneo Corporal de 5 Min', description: 'Notice tension and release it', descriptionEs: 'Nota la tensión y libérala', category: 'rest', estimatedMinutes: 5, difficulty: 'beginner', icon: '🧘' },
  { id: 'no_screens_30', name: 'No Screens 30 Min Before Bed', nameEs: 'Sin Pantallas 30 Min Antes de Dormir', description: 'Improve your sleep quality', descriptionEs: 'Mejora la calidad de tu sueño', category: 'rest', estimatedMinutes: 30, difficulty: 'easy', icon: '📵' },
  { id: 'consistent_bedtime', name: 'Consistent Bedtime', nameEs: 'Hora de Dormir Consistente', description: 'Go to bed at the same time', descriptionEs: 'Acuéstate a la misma hora', category: 'rest', estimatedMinutes: 1, difficulty: 'easy', icon: '🛏️' },
  { id: 'power_nap', name: '15-Minute Power Nap', nameEs: 'Siesta de 15 Min', description: 'A short nap to recharge', descriptionEs: 'Una siesta corta para recargarte', category: 'rest', estimatedMinutes: 15, difficulty: 'beginner', icon: '😴' },
  { id: 'wind_down', name: 'Evening Wind-Down Routine', nameEs: 'Rutina Nocturna de Relajación', description: 'Create a calming pre-sleep ritual', descriptionEs: 'Crea un ritual relajante antes de dormir', category: 'rest', estimatedMinutes: 15, difficulty: 'easy', icon: '🌛' },
  { id: 'limit_caffeine', name: 'No Caffeine After 2 PM', nameEs: 'Sin Cafeína Después de 2 PM', description: 'Protect your natural sleep', descriptionEs: 'Protege tu sueño natural', category: 'rest', estimatedMinutes: 1, difficulty: 'easy', icon: '☕' },
  { id: 'guided_meditation', name: '10-Minute Guided Meditation', nameEs: 'Meditación Guiada de 10 Min', description: 'Follow a calming guided session', descriptionEs: 'Sigue una sesión guiada relajante', category: 'rest', estimatedMinutes: 10, difficulty: 'easy', icon: '🎧' },

  // Connection (7)
  { id: 'text_friend', name: 'Text a Friend', nameEs: 'Envía un Mensaje a una Amiga', description: 'Reach out to someone you care about', descriptionEs: 'Comunícate con alguien que te importa', category: 'connection', estimatedMinutes: 2, difficulty: 'beginner', icon: '💬' },
  { id: 'family_time', name: 'Quality Family Time', nameEs: 'Tiempo de Calidad en Familia', description: '15 minutes of undivided attention', descriptionEs: '15 minutos de atención completa', category: 'connection', estimatedMinutes: 15, difficulty: 'beginner', icon: '👨‍👩‍👧' },
  { id: 'gratitude_share', name: 'Share a Gratitude', nameEs: 'Comparte una Gratitud', description: 'Tell someone what you appreciate about them', descriptionEs: 'Dile a alguien lo que aprecias de ellos', category: 'connection', estimatedMinutes: 2, difficulty: 'beginner', icon: '🙏' },
  { id: 'phone_call', name: 'Call Someone You Miss', nameEs: 'Llama a Alguien que Extrañas', description: 'A quick call to reconnect', descriptionEs: 'Una llamada rápida para reconectar', category: 'connection', estimatedMinutes: 10, difficulty: 'easy', icon: '📞' },
  { id: 'compliment', name: 'Give a Genuine Compliment', nameEs: 'Da un Cumplido Genuino', description: 'Brighten someone\'s day', descriptionEs: 'Alegra el día de alguien', category: 'connection', estimatedMinutes: 1, difficulty: 'beginner', icon: '😊' },
  { id: 'help_someone', name: 'Help Someone Today', nameEs: 'Ayuda a Alguien Hoy', description: 'Small acts of kindness boost your mood', descriptionEs: 'Pequeños actos de bondad mejoran tu ánimo', category: 'connection', estimatedMinutes: 10, difficulty: 'easy', icon: '🤝' },
  { id: 'listen_deeply', name: 'Listen Without Advising', nameEs: 'Escucha Sin Aconsejar', description: 'Practice active listening in a conversation', descriptionEs: 'Practica la escucha activa en una conversación', category: 'connection', estimatedMinutes: 10, difficulty: 'easy', icon: '👂' },

  // Joy (7)
  { id: 'play_music', name: 'Listen to Your Favorite Music', nameEs: 'Escucha Tu Música Favorita', description: 'Let music boost your mood', descriptionEs: 'Deja que la música mejore tu ánimo', category: 'joy', estimatedMinutes: 5, difficulty: 'beginner', icon: '🎵' },
  { id: 'nature_time', name: '10 Minutes in Nature', nameEs: '10 Minutos en la Naturaleza', description: 'Step outside and appreciate the world', descriptionEs: 'Sal y aprecia el mundo', category: 'joy', estimatedMinutes: 10, difficulty: 'beginner', icon: '🌿' },
  { id: 'creative_time', name: '15 Minutes of Creativity', nameEs: '15 Minutos de Creatividad', description: 'Draw, write, craft — anything creative', descriptionEs: 'Dibuja, escribe, crea — lo que sea creativo', category: 'joy', estimatedMinutes: 15, difficulty: 'beginner', icon: '🎨' },
  { id: 'laugh', name: 'Watch Something Funny', nameEs: 'Ve Algo Gracioso', description: 'Laughter is powerful medicine', descriptionEs: 'La risa es una medicina poderosa', category: 'joy', estimatedMinutes: 10, difficulty: 'beginner', icon: '😂' },
  { id: 'play_with_pet', name: 'Play with a Pet', nameEs: 'Juega con una Mascota', description: 'Pets reduce stress and increase happiness', descriptionEs: 'Las mascotas reducen el estrés y aumentan la felicidad', category: 'joy', estimatedMinutes: 10, difficulty: 'beginner', icon: '🐕' },
  { id: 'sunrise_sunset', name: 'Watch Sunrise or Sunset', nameEs: 'Ve el Amanecer o Atardecer', description: 'A moment of natural beauty', descriptionEs: 'Un momento de belleza natural', category: 'joy', estimatedMinutes: 10, difficulty: 'beginner', icon: '🌅' },
  { id: 'hobby_time', name: 'Spend Time on a Hobby', nameEs: 'Dedica Tiempo a un Pasatiempo', description: 'Do something just because you enjoy it', descriptionEs: 'Haz algo solo porque lo disfrutas', category: 'joy', estimatedMinutes: 20, difficulty: 'beginner', icon: '🎯' },

  // Mind (8)
  { id: 'journal_3min', name: '3-Minute Journaling', nameEs: 'Diario de 3 Min', description: 'Write down your thoughts freely', descriptionEs: 'Escribe tus pensamientos libremente', category: 'mind', estimatedMinutes: 3, difficulty: 'beginner', icon: '📝' },
  { id: 'read_10min', name: 'Read for 10 Minutes', nameEs: 'Lee por 10 Minutos', description: 'Feed your mind with something new', descriptionEs: 'Alimenta tu mente con algo nuevo', category: 'mind', estimatedMinutes: 10, difficulty: 'beginner', icon: '📖' },
  { id: 'morning_gratitude', name: 'Morning Gratitude Practice', nameEs: 'Práctica de Gratitud Matutina', description: 'List 3 things you\'re grateful for', descriptionEs: 'Lista 3 cosas por las que estás agradecida', category: 'mind', estimatedMinutes: 3, difficulty: 'beginner', icon: '☀️' },
  { id: 'learn_something', name: 'Learn Something New', nameEs: 'Aprende Algo Nuevo', description: 'Watch a short educational video or article', descriptionEs: 'Ve un video educativo corto o lee un artículo', category: 'mind', estimatedMinutes: 10, difficulty: 'beginner', icon: '🧠' },
  { id: 'positive_affirmation', name: 'Positive Affirmation', nameEs: 'Afirmación Positiva', description: 'Say something kind to yourself in the mirror', descriptionEs: 'Dite algo amable en el espejo', category: 'mind', estimatedMinutes: 1, difficulty: 'beginner', icon: '🪞' },
  { id: 'worry_dump', name: 'Worry Dump', nameEs: 'Descarga de Preocupaciones', description: 'Write all worries on paper to release them', descriptionEs: 'Escribe todas tus preocupaciones para liberarlas', category: 'mind', estimatedMinutes: 5, difficulty: 'beginner', icon: '📋' },
  { id: 'digital_detox', name: '30-Min Digital Detox', nameEs: 'Desintoxicación Digital de 30 Min', description: 'Step away from all screens', descriptionEs: 'Aléjate de todas las pantallas', category: 'mind', estimatedMinutes: 30, difficulty: 'moderate', icon: '📵' },
  { id: 'evening_reflection', name: 'Evening Reflection', nameEs: 'Reflexión Nocturna', description: 'Review your day with kindness', descriptionEs: 'Revisa tu día con amabilidad', category: 'mind', estimatedMinutes: 5, difficulty: 'beginner', icon: '🌙' },

  // Hydration (5)
  { id: 'morning_water', name: 'Water First Thing', nameEs: 'Agua al Despertar', description: 'Start your day hydrated', descriptionEs: 'Comienza el día hidratada', category: 'hydration', estimatedMinutes: 1, difficulty: 'beginner', icon: '💧' },
  { id: 'carry_bottle', name: 'Carry a Water Bottle', nameEs: 'Lleva una Botella de Agua', description: 'Make hydration convenient all day', descriptionEs: 'Haz la hidratación conveniente todo el día', category: 'hydration', estimatedMinutes: 1, difficulty: 'beginner', icon: '🧴' },
  { id: 'water_before_meals', name: 'Water Before Meals', nameEs: 'Agua Antes de las Comidas', description: 'Drink a glass before each meal', descriptionEs: 'Bebe un vaso antes de cada comida', category: 'hydration', estimatedMinutes: 1, difficulty: 'beginner', icon: '🥤' },
  { id: 'herbal_tea', name: 'Replace One Coffee with Tea', nameEs: 'Reemplaza un Café con Té', description: 'Herbal tea counts toward hydration', descriptionEs: 'El té de hierbas cuenta como hidratación', category: 'hydration', estimatedMinutes: 5, difficulty: 'beginner', icon: '🍵' },
  { id: 'infused_water', name: 'Make Infused Water', nameEs: 'Haz Agua con Frutas', description: 'Add lemon, cucumber, or berries to water', descriptionEs: 'Agrega limón, pepino o frutos al agua', category: 'hydration', estimatedMinutes: 3, difficulty: 'beginner', icon: '🍋' },
];
