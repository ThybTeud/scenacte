import { Pool } from 'pg';
import { config } from '../config/env.js';

const pool = new Pool({ connectionString: config.database.url });

function snakeToCamel(s) {
  return s.replace(/_([a-z])/g, (m, p) => p.toUpperCase());
}

function camelizeRow(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

const prisma = {
  user: {
    async findFirst({ where } = {}) {
      if (!where) return null;
      // OR clause
      if (where.OR && Array.isArray(where.OR)) {
        const conditions = [];
        const values = [];
        let i = 1;
        for (const cond of where.OR) {
          if (cond.email) {
            conditions.push(`email = $${i++}`);
            values.push(cond.email);
          } else if (cond.username) {
            conditions.push(`username = $${i++}`);
            values.push(cond.username);
          }
        }
        if (conditions.length === 0) return null;
        const text = `SELECT * FROM users WHERE (${conditions.join(' OR ')}) LIMIT 1`;
        const res = await query(text, values);
        return camelizeRow(res.rows[0]);
      }

      if (where.email) {
        const res = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [where.email]);
        return camelizeRow(res.rows[0]);
      }

      if (where.id) {
        const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [where.id]);
        return camelizeRow(res.rows[0]);
      }

      if (where.provider && where.providerId) {
        const res = await query('SELECT * FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1', [where.provider, where.providerId]);
        return camelizeRow(res.rows[0]);
      }

      return null;
    },

    async findUnique({ where, select } = {}) {
      if (!where) return null;

      // Si select est fourni avec _count, on doit faire une requête spéciale
      if (select && select._count) {
        let userId = null;

        if (where.email) {
          const userRes = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [where.email]);
          if (!userRes.rows[0]) return null;
          userId = userRes.rows[0].id;
        } else if (where.id) {
          userId = where.id;
        } else if (where.username) {
          const userRes = await query('SELECT id FROM users WHERE username = $1 LIMIT 1', [where.username]);
          if (!userRes.rows[0]) return null;
          userId = userRes.rows[0].id;
        } else {
          return null;
        }

        // Construire la requête avec les champs sélectionnés
        const fields = [];
        for (const [key, value] of Object.entries(select)) {
          if (key === '_count') continue; // On le gère séparément
          if (value === true) {
            const columnName = key.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase());
            fields.push(columnName);
          }
        }

        // Récupérer l'utilisateur
        const userQuery = fields.length > 0
          ? `SELECT ${fields.join(', ')} FROM users WHERE id = $1`
          : `SELECT * FROM users WHERE id = $1`;
        const userRes = await query(userQuery, [userId]);

        if (!userRes.rows[0]) return null;

        const user = camelizeRow(userRes.rows[0]);

        // Si _count est demandé
        if (select._count && select._count.select) {
          user._count = {};

          if (select._count.select.plays === true) {
            const countRes = await query(
              'SELECT COUNT(*) as count FROM plays WHERE user_id = $1',
              [userId]
            );
            user._count.plays = parseInt(countRes.rows[0].count, 10);
          }
        }

        return user;
      }

      // Comportement par défaut sans select
      if (where.email) {
        const res = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [where.email]);
        return camelizeRow(res.rows[0]);
      }
      if (where.id) {
        const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [where.id]);
        return camelizeRow(res.rows[0]);
      }
      if (where.username) {
        const res = await query('SELECT * FROM users WHERE username = $1 LIMIT 1', [where.username]);
        return camelizeRow(res.rows[0]);
      }
      return null;
    },

    async create({ data } = {}) {
      const columns = ['email'];
      const placeholders = ['$1'];
      const values = [data.email];
      let i = 2;

      if (data.username !== undefined) {
        columns.push('username');
        placeholders.push(`$${i++}`);
        values.push(data.username);
      }
      if (data.passwordHash !== undefined) {
        columns.push('password_hash');
        placeholders.push(`$${i++}`);
        values.push(data.passwordHash);
      }
      if (data.provider !== undefined) {
        columns.push('provider');
        placeholders.push(`$${i++}`);
        values.push(data.provider);
      }
      if (data.providerId !== undefined) {
        columns.push('provider_id');
        placeholders.push(`$${i++}`);
        values.push(data.providerId);
      }
      if (data.avatarUrl !== undefined) {
        columns.push('avatar_url');
        placeholders.push(`$${i++}`);
        values.push(data.avatarUrl);
      }

      const text = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      const res = await query(text, values);
      return camelizeRow(res.rows[0]);
    },

    async update({ where, data } = {}) {
      const sets = [];
      const values = [];
      let i = 1;
      for (const [k, v] of Object.entries(data)) {
        const col = k.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase()).replace('password_hash', 'password_hash');
        // special mapping for passwordHash -> password_hash and passwordUpdatedAt -> password_updated_at
        const columnName = k === 'passwordHash' ? 'password_hash' :
                          k === 'passwordUpdatedAt' ? 'password_updated_at' : col;
        sets.push(`${columnName} = $${i++}`);
        values.push(v);
      }
      values.push(where.id);
      const text = `UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
      const res = await query(text, values);
      return camelizeRow(res.rows[0]);
    },

    async delete({ where } = {}) {
      await query('DELETE FROM users WHERE id = $1', [where.id]);
      return;
    }
  },

  play: {
    async findUnique({ where } = {}) {
      if (!where || !where.id) return null;
      const res = await query('SELECT * FROM plays WHERE id = $1 LIMIT 1', [where.id]);
      return camelizeRow(res.rows[0]);
    }
  },

  playHistory: {
    async findUnique({ where } = {}) {
      if (!where || !where.id) return null;
      const res = await query('SELECT * FROM play_history WHERE id = $1 LIMIT 1', [where.id]);
      return camelizeRow(res.rows[0]);
    },

    async findFirst({ where, orderBy } = {}) {
      // Minimal support for the use-cases in the project. If needed, extend.
      const parts = [];
      const values = [];
      let i = 1;
      if (where && where.playId) {
        parts.push(`play_id = $${i++}`);
        values.push(where.playId);
      }
      let text = `SELECT * FROM play_history`;
      if (parts.length) text += ` WHERE ${parts.join(' AND ')}`;
      if (orderBy && Array.isArray(orderBy)) {
        const ob = orderBy[0];
        const [field, dir] = Object.entries(ob)[0];
        const column = field.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase());
        text += ` ORDER BY ${column} ${dir.toUpperCase()}`;
      }
      text += ' LIMIT 1';
      const res = await query(text, values);
      return camelizeRow(res.rows[0]);
    }
  },

  exportTemplate: {
    async findUnique({ where } = {}) {
      if (!where || !where.id) return null;
      const res = await query('SELECT * FROM export_templates WHERE id = $1 LIMIT 1', [where.id]);
      return camelizeRow(res.rows[0]);
    },

    async findFirst({ where, orderBy } = {}) {
      const parts = [];
      const values = [];
      let i = 1;
      if (where && where.userId) {
        parts.push(`user_id = $${i++}`);
        values.push(where.userId);
      }

      if (where && typeof where.isDefault !== 'undefined') {
        parts.push(`is_default = ${where.isDefault ? 'true' : 'false'}`);
      }

      if (where && ('playId' in where)) {
        if (where.playId === null) {
          // play_id IS NULL
          parts.push(`(play_id IS NULL OR play_id = $${i++})`);
          values.push(where.playId);
        } else {
          parts.push(`(play_id = $${i++} OR play_id IS NULL)`);
          values.push(where.playId);
        }
      }

      let text = `SELECT * FROM export_templates`;
      if (parts.length) text += ` WHERE ${parts.join(' AND ')}`;

      if (orderBy && Array.isArray(orderBy)) {
        const ob = orderBy[0];
        const [field, dir] = Object.entries(ob)[0];
        const column = field.replace(/([A-Z])/g, (m) => '_' + m.toLowerCase());
        text += ` ORDER BY ${column} ${dir.toUpperCase()}`;
      }

      text += ' LIMIT 1';
      const res = await query(text, values);
      return camelizeRow(res.rows[0]);
    }
  }
};

export default prisma;
