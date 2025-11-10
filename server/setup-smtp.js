#!/usr/bin/env node

/**
 * Script pour configurer SMTP automatiquement pour le développement
 * Crée un compte Ethereal.email (service SMTP de test gratuit)
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupSMTP() {
  console.log('🔧 Configuration SMTP pour le développement...\n');

  try {
    // Créer un compte Ethereal.email
    console.log('📧 Création d\'un compte de test Ethereal.email...');
    const testAccount = await nodemailer.createTestAccount();

    console.log('\n✅ Compte créé avec succès !');
    console.log('📬 Détails du compte SMTP :');
    console.log(`   Host: ${testAccount.smtp.host}`);
    console.log(`   Port: ${testAccount.smtp.port}`);
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(`\n🌐 Interface web: https://ethereal.email`);
    console.log(`   Login: ${testAccount.user}`);
    console.log(`   Password: ${testAccount.pass}`);

    // Lire le fichier .env actuel
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Remplacer les valeurs SMTP
    envContent = envContent.replace(/SMTP_HOST=.*/g, `SMTP_HOST=${testAccount.smtp.host}`);
    envContent = envContent.replace(/SMTP_PORT=.*/g, `SMTP_PORT=${testAccount.smtp.port}`);
    envContent = envContent.replace(/SMTP_USER=.*/g, `SMTP_USER=${testAccount.user}`);
    envContent = envContent.replace(/SMTP_PASSWORD=.*/g, `SMTP_PASSWORD=${testAccount.pass}`);

    // Écrire le fichier .env mis à jour
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Fichier .env mis à jour avec les nouvelles credentials SMTP');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Redémarrez le serveur : npm run dev');
    console.log('   2. Testez la réinitialisation de mot de passe');
    console.log('   3. Consultez les emails sur : https://ethereal.email');
    console.log('      (Utilisez les identifiants ci-dessus pour vous connecter)');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration SMTP :', error.message);
    process.exit(1);
  }
}

setupSMTP();
