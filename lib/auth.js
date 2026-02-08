// Simple authentication check
// For production, consider using NextAuth.js or similar

export const AUTH_CONFIG = {
  // You can change these credentials in your .env file
  USERNAME: process.env.AUTH_USERNAME || 'admin',
  PASSWORD: process.env.AUTH_PASSWORD || 'admin123',
};

export function checkAuth(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return false;
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === AUTH_CONFIG.USERNAME && password === AUTH_CONFIG.PASSWORD) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

export function requireAuth(handler) {
  return async (req, res) => {
    if (!checkAuth(req, res)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return handler(req, res);
  };
}