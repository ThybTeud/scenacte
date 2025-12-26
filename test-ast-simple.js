#!/usr/bin/env node

/**
 * Script de test simple pour l'endpoint AST
 * Usage: node test-ast-simple.js [email] [password]
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const EMAIL = process.argv[2] || 'test@example.com';
const PASSWORD = process.argv[3] || 'password123';

console.log('🎭 Test de l\'endpoint AST de Scenacte');
console.log('======================================\n');

async function testAST() {
  try {
    // Étape 1: Connexion
    console.log(`📝 Étape 1: Connexion avec l'utilisateur ${EMAIL}...`);
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Erreur de connexion:', error);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie!\n');

    // Étape 2: Récupérer la liste des pièces
    console.log('📚 Étape 2: Récupération de la liste des pièces...');
    const playsResponse = await fetch(`${API_URL}/plays`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!playsResponse.ok) {
      const error = await playsResponse.text();
      console.error('❌ Erreur lors de la récupération des pièces:', error);
      return;
    }

    const playsData = await playsResponse.json();

    if (!playsData.plays || playsData.plays.length === 0) {
      console.log('❌ Aucune pièce trouvée pour cet utilisateur');
      console.log('\n💡 Conseil: Créez d\'abord une pièce dans l\'application web');
      return;
    }

    const playId = playsData.plays[0].id;
    const playTitle = playsData.plays[0].title;
    console.log(`✅ Pièce trouvée: "${playTitle}" (${playId})\n`);

    // Étape 3: Récupérer l'AST
    console.log(`🌳 Étape 3: Récupération de l'AST pour la pièce "${playTitle}"...\n`);
    const astResponse = await fetch(`${API_URL}/plays/${playId}/ast`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!astResponse.ok) {
      const error = await astResponse.text();
      console.error('❌ Erreur lors de la récupération de l\'AST:', error);
      return;
    }

    const astData = await astResponse.json();

    console.log('✅ AST récupéré avec succès!\n');
    console.log('======================================');
    console.log('📊 RÉSULTAT DE L\'AST');
    console.log('======================================\n');

    // Afficher l'AST formaté
    console.log(JSON.stringify(astData, null, 2));

    console.log('\n======================================');
    console.log('📈 STATISTIQUES DE L\'AST');
    console.log('======================================');

    // Analyser l'AST
    const ast = astData.ast;
    console.log(`Titre: ${astData.title}`);
    console.log(`Type de nœud racine: ${ast.type}`);
    console.log(`Nombre d'enfants directs: ${ast.children?.length || 0}`);

    // Compter les types de nœuds
    const countNodeTypes = (node) => {
      const counts = {};
      const traverse = (n) => {
        counts[n.type] = (counts[n.type] || 0) + 1;
        if (n.children) {
          n.children.forEach(traverse);
        }
      };
      traverse(node);
      return counts;
    };

    const nodeCounts = countNodeTypes(ast);
    console.log('\nRépartition des nœuds dans l\'AST:');
    Object.entries(nodeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log('\n✨ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

testAST();
