import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import { pool } from '../config/database.js';

// Helper pour nettoyer la base de données après chaque test
afterEach(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['test_%']);
});

// Fermer le pool après tous les tests
afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/register', () => {
  it('devrait créer un nouvel utilisateur', async () => {
    const userData = {
      email: `test_${faker.internet.email()}`,
      username: faker.internet.username(),
      password: faker.internet.password({ length: 12 })
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('devrait rejeter un email dupliqué', async () => {
    const userData = {
      email: `test_${faker.internet.email()}`,
      username: faker.internet.username(),
      password: faker.internet.password({ length: 12 })
    };

    // Créer le premier utilisateur
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Tenter de créer un utilisateur avec le même email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        ...userData,
        username: faker.internet.username() // Username différent
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('existe déjà');
  });

  it('devrait rejeter un mot de passe trop court', async () => {
    const userData = {
      email: `test_${faker.internet.email()}`,
      username: faker.internet.username(),
      password: '1234567' // 7 caractères (min: 8)
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('8 caractères');
  });
});

describe('POST /api/auth/login', () => {
  it('devrait connecter un utilisateur avec des identifiants valides', async () => {
    const userData = {
      email: `test_${faker.internet.email()}`,
      username: faker.internet.username(),
      password: faker.internet.password({ length: 12 })
    };

    // Créer l'utilisateur
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Se connecter
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
  });

  it('devrait rejeter un mauvais mot de passe', async () => {
    const userData = {
      email: `test_${faker.internet.email()}`,
      username: faker.internet.username(),
      password: faker.internet.password({ length: 12 })
    };

    // Créer l'utilisateur
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Tenter de se connecter avec un mauvais mot de passe
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: 'mauvais_mot_de_passe'
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  it('devrait rejeter un email invalide', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'email_invalide',
        password: faker.internet.password({ length: 12 })
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
