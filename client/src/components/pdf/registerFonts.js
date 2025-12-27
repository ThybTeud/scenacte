import { Font } from '@react-pdf/renderer';

// Désactiver l'hyphenation pour éviter les warnings
Font.registerHyphenationCallback((word) => [word]);

// Note: On utilise les polices système intégrées (Times-Roman, Helvetica)
// Pas besoin de Font.register() pour celles-ci
