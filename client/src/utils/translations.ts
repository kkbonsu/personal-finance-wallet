export const translations = {
  en: {
    // Navigation
    home: "Home",
    wallet: "Wallet", 
    defi: "DeFi",
    vault: "Vault",
    history: "History",
    profile: "Profile",
    
    // Common actions
    send: "Send",
    receive: "Receive", 
    swap: "Swap",
    buy: "Buy",
    sell: "Sell",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    back: "Back",
    next: "Next",
    done: "Done",
    
    // Authentication
    unlock: "Unlock Wallet",
    enterPasscode: "Enter Passcode",
    biometricPrompt: "Use biometric authentication",
    wrongPasscode: "Incorrect passcode",
    walletLocked: "Wallet Locked",
    autoLockIn: "Auto-lock in",
    
    // Settings
    settings: "Settings",
    security: "Security",
    preferences: "Preferences",
    about: "About",
    currency: "Display Currency",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    
    // Security settings
    passcode: "Passcode",
    biometrics: "Biometric Login",
    autoLock: "Auto Lock",
    seedphrase: "Recovery Phrase",
    backupSeedphrase: "Backup Recovery Phrase",
    viewSeedphrase: "View Recovery Phrase",
    
    // Wallet
    totalBalance: "Total Balance",
    availableBalance: "Available Balance",
    portfolioValue: "Portfolio Value",
    
    // DeFi
    totalInvested: "Total Invested",
    averageAPY: "Avg. APY",
    myPositions: "My Positions",
    opportunities: "Opportunities",
    
    // Vault
    totalDeposited: "Total Deposited",
    totalValue: "Total Value",
    myDeposits: "My Deposits",
    newDeposit: "New Deposit"
  },
  
  es: {
    // Navigation
    home: "Inicio",
    wallet: "Billetera",
    defi: "DeFi", 
    vault: "Bóveda",
    history: "Historial",
    profile: "Perfil",
    
    // Common actions
    send: "Enviar",
    receive: "Recibir",
    swap: "Intercambiar", 
    buy: "Comprar",
    sell: "Vender",
    confirm: "Confirmar",
    cancel: "Cancelar",
    save: "Guardar",
    back: "Atrás",
    next: "Siguiente",
    done: "Hecho",
    
    // Authentication
    unlock: "Desbloquear Billetera",
    enterPasscode: "Ingrese Código",
    biometricPrompt: "Usar autenticación biométrica",
    wrongPasscode: "Código incorrecto",
    walletLocked: "Billetera Bloqueada",
    autoLockIn: "Auto-bloqueo en",
    
    // Settings
    settings: "Configuración",
    security: "Seguridad",
    preferences: "Preferencias", 
    about: "Acerca de",
    currency: "Moneda de Visualización",
    language: "Idioma",
    theme: "Tema",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    
    // Security settings
    passcode: "Código de Acceso",
    biometrics: "Inicio Biométrico",
    autoLock: "Bloqueo Automático",
    seedphrase: "Frase de Recuperación",
    backupSeedphrase: "Respaldar Frase de Recuperación",
    viewSeedphrase: "Ver Frase de Recuperación",
    
    // Wallet
    totalBalance: "Saldo Total",
    availableBalance: "Saldo Disponible",
    portfolioValue: "Valor del Portafolio",
    
    // DeFi
    totalInvested: "Total Invertido",
    averageAPY: "APY Promedio",
    myPositions: "Mis Posiciones",
    opportunities: "Oportunidades",
    
    // Vault
    totalDeposited: "Total Depositado",
    totalValue: "Valor Total",
    myDeposits: "Mis Depósitos", 
    newDeposit: "Nuevo Depósito"
  },
  
  fr: {
    // Navigation
    home: "Accueil",
    wallet: "Portefeuille",
    defi: "DeFi",
    vault: "Coffre",
    history: "Historique", 
    profile: "Profil",
    
    // Common actions
    send: "Envoyer",
    receive: "Recevoir",
    swap: "Échanger",
    buy: "Acheter",
    sell: "Vendre",
    confirm: "Confirmer",
    cancel: "Annuler",
    save: "Sauvegarder",
    back: "Retour",
    next: "Suivant",
    done: "Terminé",
    
    // Authentication
    unlock: "Déverrouiller le Portefeuille",
    enterPasscode: "Entrez le Code",
    biometricPrompt: "Utiliser l'authentification biométrique",
    wrongPasscode: "Code incorrect",
    walletLocked: "Portefeuille Verrouillé",
    autoLockIn: "Verrouillage auto dans",
    
    // Settings
    settings: "Paramètres",
    security: "Sécurité",
    preferences: "Préférences",
    about: "À propos", 
    currency: "Devise d'Affichage",
    language: "Langue",
    theme: "Thème",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    
    // Security settings
    passcode: "Code d'Accès",
    biometrics: "Connexion Biométrique",
    autoLock: "Verrouillage Automatique",
    seedphrase: "Phrase de Récupération",
    backupSeedphrase: "Sauvegarder la Phrase de Récupération",
    viewSeedphrase: "Voir la Phrase de Récupération",
    
    // Wallet
    totalBalance: "Solde Total",
    availableBalance: "Solde Disponible",
    portfolioValue: "Valeur du Portefeuille",
    
    // DeFi
    totalInvested: "Total Investi",
    averageAPY: "APY Moyen",
    myPositions: "Mes Positions",
    opportunities: "Opportunités",
    
    // Vault
    totalDeposited: "Total Déposé",
    totalValue: "Valeur Totale",
    myDeposits: "Mes Dépôts",
    newDeposit: "Nouveau Dépôt"
  }
};

export type TranslationKey = keyof typeof translations.en;
export type SupportedLanguage = keyof typeof translations;