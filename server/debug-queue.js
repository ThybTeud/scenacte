import { pool } from './src/config/database.js';

async function debugQueue() {
  try {
    console.log('\n=== DIAGNOSTIC PGBOSS QUEUE ===\n');

    // 1. Vérifier si les tables PgBoss existent
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'pgboss'
      ORDER BY table_name
    `);
    console.log('📋 Tables PgBoss existantes:');
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // 2. Compter les jobs par état
    const countResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
      GROUP BY state
      ORDER BY count DESC
    `);
    console.log('\n📊 Jobs "send-email" par état:');
    countResult.rows.forEach(row => console.log(`  ${row.state}: ${row.count}`));

    // 3. Afficher les derniers jobs
    const jobsResult = await pool.query(`
      SELECT
        id,
        name,
        state,
        priority,
        retrycount,
        retrylimit,
        startafter,
        startedon,
        completedon,
        expirein,
        createdon,
        data->>'to' as email_to,
        data->>'subject' as subject
      FROM pgboss.job
      WHERE name = 'send-email'
      ORDER BY createdon DESC
      LIMIT 10
    `);

    console.log('\n📧 Derniers jobs "send-email":');
    jobsResult.rows.forEach(job => {
      console.log('\n---');
      console.log(`ID: ${job.id}`);
      console.log(`État: ${job.state}`);
      console.log(`Email: ${job.email_to}`);
      console.log(`Sujet: ${job.subject}`);
      console.log(`Créé: ${job.createdon}`);
      console.log(`Start After: ${job.startafter}`);
      console.log(`Started On: ${job.startedon}`);
      console.log(`Completed On: ${job.completedon}`);
      console.log(`Retry: ${job.retrycount}/${job.retrylimit}`);
      console.log(`Priority: ${job.priority}`);
      console.log(`Expire In: ${job.expirein}`);
    });

    // 4. Vérifier les jobs bloqués
    const blockedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
        AND state = 'active'
        AND startedon < NOW() - INTERVAL '5 minutes'
    `);
    console.log(`\n⚠️  Jobs bloqués (actifs depuis >5min): ${blockedResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

debugQueue();
