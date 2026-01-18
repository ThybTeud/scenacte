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
        retry_count,
        retry_limit,
        start_after,
        started_on,
        completed_on,
        expire_in,
        created_on,
        data->>'to' as email_to,
        data->>'subject' as subject
      FROM pgboss.job
      WHERE name = 'send-email'
      ORDER BY created_on DESC
      LIMIT 10
    `);

    console.log('\n📧 Derniers jobs "send-email":');
    jobsResult.rows.forEach(job => {
      console.log('\n---');
      console.log(`ID: ${job.id}`);
      console.log(`État: ${job.state}`);
      console.log(`Email: ${job.email_to}`);
      console.log(`Sujet: ${job.subject}`);
      console.log(`Créé: ${job.created_on}`);
      console.log(`Start After: ${job.start_after}`);
      console.log(`Started On: ${job.started_on}`);
      console.log(`Completed On: ${job.completed_on}`);
      console.log(`Retry: ${job.retry_count}/${job.retry_limit}`);
      console.log(`Priority: ${job.priority}`);
      console.log(`Expire In: ${job.expire_in}`);
    });

    // 4. Vérifier les jobs bloqués
    const blockedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
        AND state = 'active'
        AND started_on < NOW() - INTERVAL '5 minutes'
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
