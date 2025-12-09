import bcrypt from 'bcryptjs';
// import { UserModel } from '../models/User.js';
import prisma from '../utils/database.js';
import { registerSchema, loginSchema } from '../middleware/validation.js';
import z from 'zod';
import { logAudit, AUDIT_ACTIONS } from '../utils/auditLogger.js';


export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
     await logAudit(
      AUDIT_ACTIONS.REGISTER,
      null,
      validatedData.email,
      'Register failed - user already exist',
      req.ip,
      req.get('user-agent')
     )
     return res.status(400).json({error: 'User already exist'});
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role
      }
    });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
      await logAudit(
        AUDIT_ACTIONS.REGISTER,
        user.id,
        user.email,
        'User register succes',
        req.ip,
        req.get('user-Agent')
      )

       res.status(201).json({
      message: 'User created successfully',
      user: req.session.user
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      await logAudit(
        AUDIT_ACTIONS.REGISTER,
        null,
        req.body.email,
        `Registration error: ${error.message}`,
        req.ip,
        req.get('User-agent')
      )

      if(error instanceof z.ZodError){
        return res.status(400).json({
          error: 'Validation failed',
          detals: error.errors
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
    
  }
}

export const login = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email)
    
    const validatedData = loginSchema.parse(req.body)
    const { rememberMe = false } = req.body

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    
    if (!user) {
      console.log('User not found for email:', validatedData.email)
      await logAudit(
        AUDIT_ACTIONS.LOGIN_FAILED,
        null,
        validatedData.email,
        'User not found',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)
    console.log('Password valid:', isPasswordValid)

    if (!isPasswordValid) {
      console.log('Invalid password for user:', validatedData.email)
      await logAudit(
        AUDIT_ACTIONS.LOGIN_FAILED,
        user.id,
        user.email,
        'Invalid password',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    } else {
      req.session.cookie.expires = false
    }

    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err)
        return res.status(500).json({ error: 'Session error' })
      }

      // Audit log success login
      logAudit(
        AUDIT_ACTIONS.LOGIN,
        user.id,
        user.email,
        `User logged in successfully (Remember Me: ${rememberMe})`,
        req.ip,
        req.get('User-Agent')
      )

      console.log('Login successful for user:', user.email)
      
      res.json({
        message: 'Login successful',
        user: req.session.user
      })
    })

  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const logout = (req, res) => {
  // destroy
  if (req.session.user) {
    logAudit(
      AUDIT_ACTIONS.LOGOUT,
      req.session.user.id,
      req.session.user.email,
      'User logged out',
      req.ip,
      req.get('User-Agent')
    ).catch(console.error);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

export const getAuthStatus = (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      authenticated: false 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};