const express = require('express');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const db = require('./db')
const jwt = require('jsonwebtoken');
const {authMiddleware, adminMiddleware, storeMiddleware} = require('./middleware');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
};

app.get('/', async (req, res) => {
  const result = await db.query("SELECT * FROM users");
  res.json(result.rows)
})

// Register new user.
app.post("/register", async (req, res) => {
  try {
    const {name, email, password, address, role} = req.body;
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({error : 'All fields are required'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser  = `
      INSERT INTO users (name, email, password_hash, address, role) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role
    `;

    const values = [name, email, hashedPassword, address, role];

    const result = await db.query(createUser, values);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Registration', err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// login API
app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password){
      return res.status(400).json({error : 'Email and Password are required'});
    }

    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({error : 'Invalid User'});
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({error : 'Invalid Password'});
    }

    const storeQuery = 'SELECT id FROM stores WHERE owner_id = $1';
    const storeRes = await db.query(storeQuery, [user.id]);
    const storeId = user.role === 'store_owner' ? storeRes.rows[0]?.id || null : null;

    // Generate JWT
    const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          storeId: storeId,
        },
        JWT_SECRET,
        {expiresIn: '1d'},
      );
  
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

//Add user (admin-only)
app.post('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, password, role, address } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, role, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'User creation failed' });
  }
});

//Add Store (admin-only)
app.post('/admin/stores', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, owner_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Store creation failed' });
  }
});

// Dashboard stats (admin-only)
app.get('/admin/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const storesCount = await db.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await db.query('SELECT COUNT(*) FROM ratings');
    res.json({
      total_users: usersCount.rows[0].count,
      total_stores: storesCount.rows[0].count,
      total_ratings: ratingsCount.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Route: Filter users
app.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const {name = '', email = '', address = '', role = ''} = req.query;
  
  try {
    const result = await db.query(
      `SELECT id, name, email, address, role FROM users 
       WHERE name ILIKE $1 AND email ILIKE $2 AND address ILIKE $3 AND role ILIKE $4`,
      [`%${name}%`, `%${email}%`, `%${address}%`, `%${role}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Route: Filter stores
app.get('/admin/stores', authMiddleware, adminMiddleware, async (req, res) => {
  const { name = '', email = '', address = '' } = req.query;
  try {
    const result = await db.query(
      `SELECT s.id, s.name, s.email, s.address, 
              COALESCE(AVG(r.rating), 0) AS rating
       FROM stores s 
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.name ILIKE $1 AND s.email ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id`,
      [`%${name}%`, `%${email}%`, `%${address}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Route: User details
app.get('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.query('SELECT id, name, email, address, role FROM users WHERE id = $1', [id]);
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });

    const userDetails = user.rows[0];
    if (userDetails.role === 'store_owner') {
      const storeRating = await db.query(
        'SELECT COALESCE(AVG(rating), 0) AS rating FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = $1',
        [id]
      );
      userDetails.rating = storeRating.rows[0].rating;
    }

    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// List of Store for user 
app.get('/stores', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { name = '', address = '' } = req.query;
  try {
    const result = await db.query(
      `SELECT s.id, s.name, s.address, 
        COALESCE(AVG(r.rating), 0) AS overall_rating,
        MAX(CASE WHEN r.user_id = $1 THEN r.rating ELSE NULL END) AS user_rating,
        COUNT(r.id) AS rating_count
      FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.name ILIKE $2 OR s.address ILIKE $3
        GROUP BY s.id`,
      [userId, `%${name}%`, `%${address}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

app.post('/stores/:storeId/rate', authMiddleware, async (req, res) =>     {
  const userId = req.user.id;
  const { storeId } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if rating already exists
    const existing = await db.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
        [rating, userId, storeId]
      );
    } else {
      await db.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [userId, storeId, rating]
      );
    }

    res.json({ message: 'Rating saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

// GET /store-owner/dashboard
app.get('/store/dashboard', authMiddleware, storeMiddleware, async (req, res) => {
  try {
    const storeId = req.user.storeId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID missing for user' });
    }

    const result = await db.query(
      `SELECT u.name AS user_name, r.rating, u.address, u.email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.rating DESC`,
      [storeId]
    );

    const avg = await db.query(
      `SELECT AVG(rating)::numeric(3,1) AS avg_rating
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );

    const storeInfo = await db.query(
      `SELECT name FROM stores WHERE id = $1`,
      [storeId]
    );

    if (!storeInfo.rows.length) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({
      store_name: storeInfo.rows[0].name,
      average_rating: avg.rows[0].avg_rating || 0,
      ratings: result.rows,
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Update password
app.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running: http://localhost:${PORT}`);
});