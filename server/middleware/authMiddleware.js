import { supabase } from '../lib/supabase-client.js';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Attach user info
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export default authenticate;