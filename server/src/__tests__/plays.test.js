import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import { pool } from '../config/database.js';

/**
 * Helper pour créer un utilisateur et récupérer son token
 */
async function createUserAndGetToken() {
  const userData = {
    email: `test_${faker.internet.email()}`,
    username: faker.internet.username(),
    password: faker.internet.password({ length: 12 })
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send(userData);

  return {
    token: response.body.token,
    userId: response.body.user.id,
    user: response.body.user
  };
}

/**
 * Helper pour créer une pièce de test
 */
function createPlayData() {
  return {
    title: faker.lorem.words(3),
    subtitle: faker.lorem.words(5),
    rawContent: faker.lorem.paragraphs(3),
    htmlContent: `<p>${faker.lorem.paragraphs(3)}</p>`,
    statistics: {
      characterCount: 150,
      wordCount: 50,
      lineCount: 10,
      sceneCount: 2,
      actCount: 1,
      pageCount: 1,
      speakingCharacterCount: 3
    }
  };
}

// Nettoyer après chaque test
afterEach(async () => {
  await pool.query('DELETE FROM plays WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['test_%']);
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['test_%']);
});

// Fermer le pool après tous les tests
afterAll(async () => {
  await pool.end();
});

describe('GET /api/plays', () => {
  it('devrait retourner 401 sans token', async () => {
    const response = await request(app)
      .get('/api/plays')
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  it('devrait retourner les pièces de l\'utilisateur connecté', async () => {
    const { token } = await createUserAndGetToken();

    const response = await request(app)
      .get('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('plays');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.plays)).toBe(true);
  });
});

describe('POST /api/plays', () => {
  it('devrait créer une nouvelle pièce avec un token valide', async () => {
    const { token } = await createUserAndGetToken();
    const playData = createPlayData();

    const response = await request(app)
      .post('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .send(playData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(playData.title);
    expect(response.body.subtitle).toBe(playData.subtitle);
    expect(response.body).toHaveProperty('status', 'draft');
  });

  it('devrait rejeter une pièce sans titre', async () => {
    const { token } = await createUserAndGetToken();
    const playData = createPlayData();
    delete playData.title;

    const response = await request(app)
      .post('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .send(playData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('titre');
  });

  it('devrait rejeter une pièce avec des statistiques invalides', async () => {
    const { token } = await createUserAndGetToken();
    const playData = createPlayData();
    playData.statistics.wordCount = -10; // Invalide (négatif)

    const response = await request(app)
      .post('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .send(playData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /api/plays/:id', () => {
  it('devrait récupérer une pièce spécifique', async () => {
    const { token } = await createUserAndGetToken();
    const playData = createPlayData();

    // Créer la pièce
    const createResponse = await request(app)
      .post('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .send(playData);

    const playId = createResponse.body.id;

    // Récupérer la pièce
    const response = await request(app)
      .get(`/api/plays/${playId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.id).toBe(playId);
    expect(response.body.title).toBe(playData.title);
  });

  it('devrait retourner 404 pour une pièce inexistante', async () => {
    const { token } = await createUserAndGetToken();

    await request(app)
      .get('/api/plays/99999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});

describe('PATCH /api/plays/:id/status', () => {
  it('devrait changer le statut d\'une pièce', async () => {
    const { token } = await createUserAndGetToken();
    const playData = createPlayData();

    // Créer la pièce
    const createResponse = await request(app)
      .post('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .send(playData);

    const playId = createResponse.body.id;

    // Changer le statut
    const response = await request(app)
      .patch(`/api/plays/${playId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(response.body.status).toBe('completed');
  });

  it('devrait rejeter un statut invalide', async () => {
    const { token } = await createUserAndGetToken();
    const playData = createPlayData();

    // Créer la pièce
    const createResponse = await request(app)
      .post('/api/plays')
      .set('Authorization', `Bearer ${token}`)
      .send(playData);

    const playId = createResponse.body.id;

    // Tenter de changer avec un statut invalide
    const response = await request(app)
      .patch(`/api/plays/${playId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
