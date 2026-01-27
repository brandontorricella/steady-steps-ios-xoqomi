// SteadySteps Internationalization System

export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      progress: 'Progress',
      coach: 'Coach',
      badges: 'Badges',
      profile: 'Profile',
    },
    // Common
    common: {
      continue: 'Continue',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      skip: 'Skip',
      done: 'Done',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Try again',
    },
    // Language Selection
    language: {
      title: 'Choose Your Language',
      english: 'English',
      spanish: 'Español',
    },
    // Welcome
    welcome: {
      title: 'Welcome to SteadySteps',
      subtitle: 'Small steps lead to lasting change',
      description: 'This app is designed for real life, not perfection.',
      getStarted: 'Get Started',
      haveAccount: 'Already have an account? Log in',
    },
    // Name
    name: {
      title: 'What should we call you?',
      placeholder: 'Your first name',
    },
    // Account
    account: {
      createTitle: 'Create Your Account',
      createSubtitle: 'Save your progress and access it anywhere',
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Log in to continue your journey',
      email: 'Email',
      emailPlaceholder: 'yourname@example.com',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      signIn: 'Sign In',
      signUp: 'Create Account',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account? Sign up",
      hasAccount: 'Already have an account? Sign in',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      invalidEmail: 'Please enter a valid email address',
    },
    // Goals
    goal: {
      title: 'What matters most to you right now?',
      subtitle: 'This helps us personalize your experience',
      weightLoss: 'I want to lose weight gradually',
      energy: 'I want to have more energy',
      habits: 'I want to build healthier habits',
      confidence: 'I want to feel better about myself',
    },
    // Activity Level
    activity: {
      title: 'How active are you on a typical day?',
      subtitle: 'Be honest. This helps us set the right pace.',
      sedentary: 'Mostly sitting throughout the day',
      light: 'Some walking but not much else',
      moderate: 'Moderately active with occasional exercise',
    },
    // Nutrition
    nutrition: {
      title: 'What is your biggest nutrition challenge?',
      subtitle: 'We will focus on this together',
      sugaryDrinks: 'Sugary drinks (soda, juice, sweetened coffee)',
      lateSnacking: 'Late-night snacking',
      portions: 'Portion sizes',
      processedFood: 'Too much processed food',
      unsure: 'Not sure where to start',
    },
    // Time Commitment
    time: {
      title: 'How much time can you commit daily?',
      subtitle: 'We start small. You can always increase later.',
      fiveToTen: '5-10 minutes',
      tenToFifteen: '10-15 minutes',
      fifteenToTwenty: '15-20 minutes',
      twentyToThirty: '20-30 minutes',
      thirtyToFortyFive: '30-45 minutes',
      fortyFiveToSixty: '45-60 minutes',
    },
    // Coach
    coach: {
      meetTitle: 'Meet Coach Lily',
      meetSubtitle: 'Your personal guide to healthier habits',
      meetDescription: 'Coach Lily is here to answer your questions about fitness and nutrition anytime. No question is too simple. Think of her as your supportive friend who happens to know a lot about healthy living.',
      meetButton: 'Nice to Meet You, Coach!',
      features: {
        movement: 'Simple movement ideas',
        nutrition: 'Nutrition tips and healthy swaps',
        motivation: 'Motivation when you need it',
        questions: 'Answers to your health questions',
      },
      chatTitle: 'Coach Lily',
      chatSubtitle: 'Your personal wellness guide',
      askPlaceholder: 'Ask your coach anything...',
      suggestionsTitle: 'Questions to explore today',
    },
    // Notifications
    notifications: {
      title: 'Stay on Track',
      subtitle: 'Gentle reminders help build habits',
      morning: 'Morning motivation',
      morningDesc: 'Start your day inspired',
      midday: 'Midday nutrition nudge',
      middayDesc: 'Quick lunchtime check-in',
      evening: 'Evening reminder',
      eveningDesc: 'Log your day before bed',
    },
    // Terms
    terms: {
      title: 'Almost There!',
      subtitle: 'Please review and accept our terms to continue',
      termsLink: 'Terms and Conditions',
      privacyLink: 'Privacy Policy',
      agree: 'I have read and agree to the Terms and Conditions and Privacy Policy',
      mustAccept: 'Please accept the terms to continue',
    },
    // Payment
    payment: {
      title: 'Start Your Journey',
      subtitle: 'Join thousands of women building healthier habits',
      monthly: 'Monthly',
      monthlyDesc: 'Flexible, cancel anytime',
      annual: 'Annual',
      annualDesc: 'Best value',
      save: 'Save 50%',
      perMonth: '/month',
      perYear: '/year',
      startTrial: 'Start My Free 7-Day Trial',
      trialNote: 'Your free trial starts today. You will not be charged until',
      cancelAnytime: 'Cancel anytime in settings.',
      features: {
        coach: 'Your personal AI fitness and nutrition coach',
        daily: 'Daily guidance that takes less than 60 seconds',
        progress: 'Progress tracking and achievement system',
        reminders: 'Gentle reminders to keep you on track',
      },
    },
    // Starting Point
    starting: {
      title: 'Your Starting Point',
      stage: 'Stage',
      goal: 'Daily Goal',
      minutes: 'minutes of movement',
      ready: "You are ready. Let's begin.",
    },
    // First Day
    firstDay: {
      title: "Here's Your Plan",
      step1: 'Check in each day (takes 30 seconds)',
      step2: 'Complete your movement goal',
      step3: 'Answer quick nutrition questions',
      step4: 'Build your streak and earn badges',
      button: "Let's Do This!",
    },
    // Dashboard
    dashboard: {
      greeting: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
      },
      streak: 'Current Streak',
      longestStreak: 'Longest',
      days: 'days',
      checkIn: "Complete Today's Check-in",
      checkInComplete: "Today's check-in complete!",
      checkInCompleteDesc: 'Great job showing up today',
      thisWeek: 'This Week',
      activities: 'activities',
      nutritionHabits: 'nutrition habits',
      level: 'Level',
      points: 'points',
      stage: 'Stage',
      dailyTip: 'Daily Tip',
      coachSays: 'Coach Lily says',
      askCoach: 'Ask Coach More',
    },
    // Check-in
    checkin: {
      activityTitle: 'Did you complete your movement goal today?',
      activityGoal: 'minutes of activity',
      yesDidIt: 'Yes, I Did It!',
      skippedToday: 'I Skipped Today',
      nutritionTitle: 'Quick nutrition check',
      moodTitle: 'How are you feeling today?',
      moodSubtitle: 'This is just for you. No wrong answers.',
      skipMood: 'Skip for today',
      celebration: 'Great job checking in!',
      pointsEarned: 'points earned',
    },
    // Mood
    mood: {
      great: 'Great',
      good: 'Good',
      okay: 'Okay',
      stressed: 'Stressed',
      tired: 'Tired',
      messages: {
        great: 'Wonderful! Keep that energy going.',
        good: 'Nice! Steady progress feels good.',
        okay: 'That is perfectly fine. You are still here.',
        stressed: 'I see you. Taking care of yourself matters even more today.',
        tired: 'Rest is part of the journey. Be gentle with yourself.',
      },
    },
    // Badges
    badges: {
      title: 'Badges',
      earned: 'earned',
      locked: 'Locked',
      categories: {
        streak: 'Streaks',
        activity: 'Activity',
        nutrition: 'Nutrition',
        perfect_day: 'Perfect Days',
        stage_level: 'Stages & Levels',
        comeback: 'Comebacks',
        special: 'Special',
        mood: 'Mood',
      },
    },
    // Progress
    progress: {
      title: 'Your Progress',
      calendar: 'Calendar',
      stats: 'Stats',
    },
    // Profile/Settings
    settings: {
      title: 'Profile',
      hello: 'Hello',
      memberSince: 'Member since',
      editProfile: 'Edit Profile',
      notifications: 'Notification Settings',
      buddies: 'My Buddies',
      habitLibrary: 'Habit Library',
      habitLibraryLocked: 'Unlocks at Consistent stage',
      inviteFriends: 'Invite Friends',
      subscription: 'Subscription',
      settingsMenu: 'Settings',
      helpSupport: 'Help & Support',
      legal: 'Legal',
      accountSecurity: 'Account Security',
      language: 'Language',
      logOut: 'Log Out',
      logOutConfirm: 'Are you sure you want to log out?',
    },
    // Subscription
    subscription: {
      title: 'Subscription',
      yourPlan: 'Your Plan',
      active: 'Active',
      trial: 'Free Trial',
      trialEnds: 'Trial ends on',
      renewsOn: 'Renews on',
      chargedOn: 'You will be charged on',
      paymentMethod: 'Payment Method',
      cardEnding: 'Card ending in',
      updatePayment: 'Update Payment Method',
      changePlan: 'Change Plan',
      cancelSubscription: 'Cancel Subscription',
      cancelTitle: 'Cancel Subscription?',
      cancelDesc: 'We are sorry to see you go. If you cancel, you will lose access to:',
      cancelFeatures: ['Coach Lily', 'Progress tracking', 'Badge collection', 'Daily reminders'],
      keepSubscription: 'Keep My Subscription',
      continueCanceling: 'Continue Canceling',
      confirmCancel: 'Confirm Cancellation',
      cancelComplete: 'Your subscription has been cancelled',
      accessUntil: 'You have access until',
    },
    // Legal
    legal: {
      title: 'Legal',
      terms: 'Terms and Conditions',
      privacy: 'Privacy Policy',
    },
    // Help
    help: {
      title: 'Help & Support',
      faq: 'Frequently Asked Questions',
      needHelp: 'Need More Help?',
      hereForYou: 'We are here for you.',
      emailSupport: 'Email Support',
      responseTime: 'We typically respond within 24 hours.',
    },
    // Habit Library
    habitLibrary: {
      title: 'Habit Library',
      subtitle: 'Choose habits that fit your life. No pressure.',
      active: 'Active Habits',
      maxHabits: 'Maximum 3 active habits at once',
      add: 'Add',
      remove: 'Remove',
      categories: {
        movement: 'Movement',
        hydration: 'Hydration',
        nutrition: 'Nutrition',
        mindfulness: 'Mindfulness',
        sleep: 'Sleep',
      },
    },
    // Buddies
    buddies: {
      title: 'Your Support Circle',
      subtitle: 'Accountability partners cheering you on',
      empty: 'Add a buddy for extra accountability',
      inviteFriend: 'Invite a Friend',
      sendEncouragement: 'Send Encouragement',
      checkedInToday: 'Checked in today',
      encouragementOptions: [
        'You are doing great! Keep going.',
        'I believe in you!',
        'We have got this together.',
        'One day at a time.',
        'So proud of your consistency.',
      ],
    },
    // Referral
    referral: {
      title: 'Invite Friends',
      shareTitle: 'Share the Journey',
      shareDesc: 'Invite friends to join you on SteadySteps. When they complete their first week, you both earn rewards!',
      copyLink: 'Copy Link',
      share: 'Share',
      yourRewards: 'Your Rewards',
      rewards: {
        signup: 'Earn a badge when your friend signs up',
        trial: 'Earn 50 points when they complete their trial',
        week: 'Earn 100 points when they complete their first week',
      },
      stats: {
        invited: 'Friends invited',
        joined: 'Friends joined',
        earned: 'Rewards earned',
      },
    },
    // Weekly Summary
    weeklySummary: {
      title: 'Your Week in Review',
      subtitle: 'Here is how you showed up for yourself',
      showingUp: 'Showing Up',
      movement: 'Movement',
      nutritionHabits: 'Nutrition Habits',
      howYouFelt: 'How You Felt',
      thisWeek: 'This Week',
      gotIt: 'Got It',
    },
    // Account deletion
    deleteAccount: {
      title: 'Delete Account?',
      warning: 'This action is permanent and cannot be undone. Deleting your account will:',
      consequence1: 'Remove all your progress and badges',
      consequence2: 'Cancel your subscription immediately',
      consequence3: 'Delete all your personal data',
      consequence4: 'Remove you from any buddy connections',
      keepAccount: 'Keep My Account',
      continueDelete: 'Continue with Deletion',
      confirmTitle: 'Are you absolutely sure?',
      confirmDesc: 'Please type DELETE to confirm you want to permanently delete your account.',
      typePlaceholder: 'Type DELETE',
      deleteButton: 'Delete My Account',
      complete: 'Your account has been deleted',
      completeDesc: 'All your data has been removed. Thank you for using SteadySteps.',
    },
  },
  es: {
    // Navigation
    nav: {
      home: 'Inicio',
      progress: 'Progreso',
      coach: 'Entrenadora',
      badges: 'Insignias',
      profile: 'Perfil',
    },
    // Common
    common: {
      continue: 'Continuar',
      back: 'Atrás',
      save: 'Guardar',
      cancel: 'Cancelar',
      skip: 'Saltar',
      done: 'Listo',
      yes: 'Sí',
      no: 'No',
      loading: 'Cargando...',
      error: 'Algo salió mal',
      retry: 'Intentar de nuevo',
    },
    // Language Selection
    language: {
      title: 'Elige Tu Idioma',
      english: 'English',
      spanish: 'Español',
    },
    // Welcome
    welcome: {
      title: 'Bienvenida a SteadySteps',
      subtitle: 'Pequeños pasos llevan a grandes cambios',
      description: 'Esta app está diseñada para la vida real, no para la perfección.',
      getStarted: 'Comenzar',
      haveAccount: '¿Ya tienes una cuenta? Iniciar sesión',
    },
    // Name
    name: {
      title: '¿Cómo te llamas?',
      placeholder: 'Tu nombre',
    },
    // Account
    account: {
      createTitle: 'Crea Tu Cuenta',
      createSubtitle: 'Guarda tu progreso y accede desde cualquier lugar',
      loginTitle: 'Bienvenida de Nuevo',
      loginSubtitle: 'Inicia sesión para continuar tu camino',
      email: 'Correo electrónico',
      emailPlaceholder: 'tucorreo@ejemplo.com',
      password: 'Contraseña',
      passwordPlaceholder: 'Crea una contraseña',
      confirmPassword: 'Confirmar contraseña',
      confirmPasswordPlaceholder: 'Confirma tu contraseña',
      signIn: 'Iniciar Sesión',
      signUp: 'Crear Cuenta',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta? Regístrate',
      hasAccount: '¿Ya tienes cuenta? Inicia sesión',
      passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
      passwordMismatch: 'Las contraseñas no coinciden',
      invalidEmail: 'Por favor ingresa un correo válido',
    },
    // Goals
    goal: {
      title: '¿Qué es lo más importante para ti ahora?',
      subtitle: 'Esto nos ayuda a personalizar tu experiencia',
      weightLoss: 'Quiero perder peso gradualmente',
      energy: 'Quiero tener más energía',
      habits: 'Quiero crear hábitos más saludables',
      confidence: 'Quiero sentirme mejor conmigo misma',
    },
    // Activity Level
    activity: {
      title: '¿Qué tan activa eres en un día normal?',
      subtitle: 'Sé honesta. Esto nos ayuda a establecer el ritmo correcto.',
      sedentary: 'Paso la mayor parte del día sentada',
      light: 'Camino un poco pero no mucho más',
      moderate: 'Moderadamente activa con ejercicio ocasional',
    },
    // Nutrition
    nutrition: {
      title: '¿Cuál es tu mayor desafío de nutrición?',
      subtitle: 'Nos enfocaremos en esto juntas',
      sugaryDrinks: 'Bebidas azucaradas (refresco, jugo, café dulce)',
      lateSnacking: 'Comer tarde en la noche',
      portions: 'Tamaño de las porciones',
      processedFood: 'Demasiada comida procesada',
      unsure: 'No estoy segura por dónde empezar',
    },
    // Time Commitment
    time: {
      title: '¿Cuánto tiempo puedes dedicar cada día?',
      subtitle: 'Empezamos poco a poco. Siempre puedes aumentar después.',
      fiveToTen: '5-10 minutos',
      tenToFifteen: '10-15 minutos',
      fifteenToTwenty: '15-20 minutos',
      twentyToThirty: '20-30 minutos',
      thirtyToFortyFive: '30-45 minutos',
      fortyFiveToSixty: '45-60 minutos',
    },
    // Coach
    coach: {
      meetTitle: 'Conoce a la Entrenadora Lily',
      meetSubtitle: 'Tu guía personal hacia hábitos más saludables',
      meetDescription: 'La Entrenadora Lily está aquí para responder tus preguntas sobre fitness y nutrición en cualquier momento. Ninguna pregunta es demasiado simple. Piensa en ella como tu amiga solidaria que sabe mucho sobre vida saludable.',
      meetButton: '¡Encantada de Conocerte, Entrenadora!',
      features: {
        movement: 'Ideas simples de movimiento',
        nutrition: 'Consejos de nutrición e intercambios saludables',
        motivation: 'Motivación cuando la necesites',
        questions: 'Respuestas a tus preguntas de salud',
      },
      chatTitle: 'Entrenadora Lily',
      chatSubtitle: 'Tu guía personal de bienestar',
      askPlaceholder: 'Pregunta lo que quieras a tu entrenadora...',
      suggestionsTitle: 'Preguntas para explorar hoy',
    },
    // Notifications
    notifications: {
      title: 'Mantente en el Camino',
      subtitle: 'Recordatorios suaves ayudan a crear hábitos',
      morning: 'Motivación matutina',
      morningDesc: 'Empieza el día inspirada',
      midday: 'Recordatorio de nutrición',
      middayDesc: 'Registro rápido a la hora del almuerzo',
      evening: 'Recordatorio nocturno',
      eveningDesc: 'Registra tu día antes de dormir',
    },
    // Terms
    terms: {
      title: '¡Ya Casi!',
      subtitle: 'Por favor revisa y acepta nuestros términos para continuar',
      termsLink: 'Términos y Condiciones',
      privacyLink: 'Política de Privacidad',
      agree: 'He leído y acepto los Términos y Condiciones y la Política de Privacidad',
      mustAccept: 'Por favor acepta los términos para continuar',
    },
    // Payment
    payment: {
      title: 'Comienza Tu Viaje',
      subtitle: 'Únete a miles de mujeres creando hábitos más saludables',
      monthly: 'Mensual',
      monthlyDesc: 'Flexible, cancela cuando quieras',
      annual: 'Anual',
      annualDesc: 'Mejor valor',
      save: 'Ahorra 50%',
      perMonth: '/mes',
      perYear: '/año',
      startTrial: 'Comenzar Mi Prueba Gratis de 7 Días',
      trialNote: 'Tu prueba gratis comienza hoy. No se te cobrará hasta',
      cancelAnytime: 'Cancela cuando quieras en configuración.',
      features: {
        coach: 'Tu entrenadora personal de fitness y nutrición con IA',
        daily: 'Guía diaria que toma menos de 60 segundos',
        progress: 'Seguimiento de progreso y sistema de logros',
        reminders: 'Recordatorios suaves para mantenerte en el camino',
      },
    },
    // Starting Point
    starting: {
      title: 'Tu Punto de Partida',
      stage: 'Etapa',
      goal: 'Meta Diaria',
      minutes: 'minutos de movimiento',
      ready: 'Estás lista. Comencemos.',
    },
    // First Day
    firstDay: {
      title: 'Este es Tu Plan',
      step1: 'Regístrate cada día (toma 30 segundos)',
      step2: 'Completa tu meta de movimiento',
      step3: 'Responde preguntas rápidas de nutrición',
      step4: 'Construye tu racha y gana insignias',
      button: '¡Vamos a Hacerlo!',
    },
    // Dashboard
    dashboard: {
      greeting: {
        morning: 'Buenos días',
        afternoon: 'Buenas tardes',
        evening: 'Buenas noches',
      },
      streak: 'Racha Actual',
      longestStreak: 'Más larga',
      days: 'días',
      checkIn: 'Completar Registro de Hoy',
      checkInComplete: '¡Registro de hoy completado!',
      checkInCompleteDesc: 'Excelente trabajo al presentarte hoy',
      thisWeek: 'Esta Semana',
      activities: 'actividades',
      nutritionHabits: 'hábitos de nutrición',
      level: 'Nivel',
      points: 'puntos',
      stage: 'Etapa',
      dailyTip: 'Consejo del Día',
      coachSays: 'La Entrenadora Lily dice',
      askCoach: 'Pregunta a la Entrenadora',
    },
    // Check-in
    checkin: {
      activityTitle: '¿Completaste tu meta de movimiento hoy?',
      activityGoal: 'minutos de actividad',
      yesDidIt: '¡Sí, Lo Hice!',
      skippedToday: 'Lo Salté Hoy',
      nutritionTitle: 'Revisión rápida de nutrición',
      moodTitle: '¿Cómo te sientes hoy?',
      moodSubtitle: 'Esto es solo para ti. No hay respuestas incorrectas.',
      skipMood: 'Saltar por hoy',
      celebration: '¡Excelente trabajo al registrarte!',
      pointsEarned: 'puntos ganados',
    },
    // Mood
    mood: {
      great: 'Genial',
      good: 'Bien',
      okay: 'Normal',
      stressed: 'Estresada',
      tired: 'Cansada',
      messages: {
        great: '¡Maravilloso! Mantén esa energía.',
        good: '¡Bien! El progreso constante se siente bien.',
        okay: 'Está perfectamente bien. Sigues aquí.',
        stressed: 'Te veo. Cuidarte a ti misma importa aún más hoy.',
        tired: 'El descanso es parte del viaje. Sé gentil contigo misma.',
      },
    },
    // Badges
    badges: {
      title: 'Insignias',
      earned: 'ganadas',
      locked: 'Bloqueada',
      categories: {
        streak: 'Rachas',
        activity: 'Actividad',
        nutrition: 'Nutrición',
        perfect_day: 'Días Perfectos',
        stage_level: 'Etapas y Niveles',
        comeback: 'Regresos',
        special: 'Especiales',
        mood: 'Estado de Ánimo',
      },
    },
    // Progress
    progress: {
      title: 'Tu Progreso',
      calendar: 'Calendario',
      stats: 'Estadísticas',
    },
    // Profile/Settings
    settings: {
      title: 'Perfil',
      hello: 'Hola',
      memberSince: 'Miembro desde',
      editProfile: 'Editar Perfil',
      notifications: 'Configuración de Notificaciones',
      buddies: 'Mis Amigas',
      habitLibrary: 'Biblioteca de Hábitos',
      habitLibraryLocked: 'Se desbloquea en etapa Consistente',
      inviteFriends: 'Invitar Amigas',
      subscription: 'Suscripción',
      settingsMenu: 'Configuración',
      helpSupport: 'Ayuda y Soporte',
      legal: 'Legal',
      accountSecurity: 'Seguridad de Cuenta',
      language: 'Idioma',
      logOut: 'Cerrar Sesión',
      logOutConfirm: '¿Estás segura de que quieres cerrar sesión?',
    },
    // Subscription
    subscription: {
      title: 'Suscripción',
      yourPlan: 'Tu Plan',
      active: 'Activo',
      trial: 'Prueba Gratis',
      trialEnds: 'La prueba termina el',
      renewsOn: 'Se renueva el',
      chargedOn: 'Se te cobrará el',
      paymentMethod: 'Método de Pago',
      cardEnding: 'Tarjeta terminada en',
      updatePayment: 'Actualizar Método de Pago',
      changePlan: 'Cambiar Plan',
      cancelSubscription: 'Cancelar Suscripción',
      cancelTitle: '¿Cancelar Suscripción?',
      cancelDesc: 'Lamentamos verte ir. Si cancelas, perderás acceso a:',
      cancelFeatures: ['Entrenadora Lily', 'Seguimiento de progreso', 'Colección de insignias', 'Recordatorios diarios'],
      keepSubscription: 'Mantener Mi Suscripción',
      continueCanceling: 'Continuar Cancelando',
      confirmCancel: 'Confirmar Cancelación',
      cancelComplete: 'Tu suscripción ha sido cancelada',
      accessUntil: 'Tienes acceso hasta',
    },
    // Legal
    legal: {
      title: 'Legal',
      terms: 'Términos y Condiciones',
      privacy: 'Política de Privacidad',
    },
    // Help
    help: {
      title: 'Ayuda y Soporte',
      faq: 'Preguntas Frecuentes',
      needHelp: '¿Necesitas Más Ayuda?',
      hereForYou: 'Estamos aquí para ti.',
      emailSupport: 'Enviar Correo a Soporte',
      responseTime: 'Normalmente respondemos en 24 horas.',
    },
    // Habit Library
    habitLibrary: {
      title: 'Biblioteca de Hábitos',
      subtitle: 'Elige hábitos que se adapten a tu vida. Sin presión.',
      active: 'Hábitos Activos',
      maxHabits: 'Máximo 3 hábitos activos a la vez',
      add: 'Agregar',
      remove: 'Quitar',
      categories: {
        movement: 'Movimiento',
        hydration: 'Hidratación',
        nutrition: 'Nutrición',
        mindfulness: 'Mindfulness',
        sleep: 'Sueño',
      },
    },
    // Buddies
    buddies: {
      title: 'Tu Círculo de Apoyo',
      subtitle: 'Compañeras de responsabilidad animándote',
      empty: 'Agrega una amiga para más responsabilidad',
      inviteFriend: 'Invitar una Amiga',
      sendEncouragement: 'Enviar Ánimo',
      checkedInToday: 'Registrada hoy',
      encouragementOptions: [
        '¡Lo estás haciendo genial! Sigue así.',
        '¡Creo en ti!',
        'Juntas podemos lograrlo.',
        'Un día a la vez.',
        'Muy orgullosa de tu constancia.',
      ],
    },
    // Referral
    referral: {
      title: 'Invitar Amigas',
      shareTitle: 'Comparte el Viaje',
      shareDesc: 'Invita amigas a unirse a SteadySteps. Cuando completen su primera semana, ¡ambas ganan recompensas!',
      copyLink: 'Copiar Enlace',
      share: 'Compartir',
      yourRewards: 'Tus Recompensas',
      rewards: {
        signup: 'Gana una insignia cuando tu amiga se registre',
        trial: 'Gana 50 puntos cuando complete su prueba',
        week: 'Gana 100 puntos cuando complete su primera semana',
      },
      stats: {
        invited: 'Amigas invitadas',
        joined: 'Amigas que se unieron',
        earned: 'Recompensas ganadas',
      },
    },
    // Weekly Summary
    weeklySummary: {
      title: 'Tu Semana en Resumen',
      subtitle: 'Así es como te presentaste para ti misma',
      showingUp: 'Presentándote',
      movement: 'Movimiento',
      nutritionHabits: 'Hábitos de Nutrición',
      howYouFelt: 'Cómo Te Sentiste',
      thisWeek: 'Esta Semana',
      gotIt: 'Entendido',
    },
    // Account deletion
    deleteAccount: {
      title: '¿Eliminar Cuenta?',
      warning: 'Esta acción es permanente y no se puede deshacer. Eliminar tu cuenta:',
      consequence1: 'Eliminará todo tu progreso e insignias',
      consequence2: 'Cancelará tu suscripción inmediatamente',
      consequence3: 'Eliminará todos tus datos personales',
      consequence4: 'Te removerá de conexiones de amigas',
      keepAccount: 'Mantener Mi Cuenta',
      continueDelete: 'Continuar con Eliminación',
      confirmTitle: '¿Estás completamente segura?',
      confirmDesc: 'Por favor escribe ELIMINAR para confirmar que quieres eliminar permanentemente tu cuenta.',
      typePlaceholder: 'Escribe ELIMINAR',
      deleteButton: 'Eliminar Mi Cuenta',
      complete: 'Tu cuenta ha sido eliminada',
      completeDesc: 'Todos tus datos han sido removidos. Gracias por usar SteadySteps.',
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// Get translation helper
export const getTranslation = (language: Language, path: string): string => {
  const keys = path.split('.');
  let result: any = translations[language];
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      // Fallback to English
      result = translations.en;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return path; // Return path if not found
        }
      }
      break;
    }
  }
  
  return typeof result === 'string' ? result : path;
};
