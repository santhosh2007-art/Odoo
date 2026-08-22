import { getOne, run } from '../config/db.js';
import {
  validatePassword,
  validateEmail,
  hashPassword,
  comparePassword,
  generateToken,
  generateVerificationToken,
} from '../utils/security.js';

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (Employee or HR/Admin)
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { employeeId, email, password, name, role } = req.body;

    // 1. Basic validation
    if (!employeeId || !email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields (employeeId, email, password, name, role) are required.',
      });
    }

    // 2. Role validation
    const validRoles = ['Employee', 'HR', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${validRoles.join(', ')}`,
      });
    }

    // 3. Email format validation
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 4. Password strength validation
    const passwordEval = validatePassword(password);
    if (!passwordEval.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not satisfy security rules.',
        errors: passwordEval.errors,
      });
    }

    // 5. Check duplicate email or employeeId
    const existingUser = await getOne(
      'SELECT id, email, employee_id FROM users WHERE email = ? OR employee_id = ?',
      [email.toLowerCase(), employeeId]
    );

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
      if (existingUser.employee_id === employeeId) {
        return res.status(409).json({
          success: false,
          message: 'An account with this Employee ID already exists.',
        });
      }
    }

    // 6. Hash password and generate email verification token
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // 7. Insert user record into SQLite database
    const insertResult = await run(
      `INSERT INTO users (employee_id, email, password_hash, name, role, is_verified, verification_token)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, email.toLowerCase(), passwordHash, name, role, 0, verificationToken]
    );

    const userId = insertResult.id;

    // 8. Auto-create initial employee profile entry
    await run(
      `INSERT INTO employee_profiles (user_id, job_title, department, date_of_joining)
       VALUES (?, ?, ?, DATE('now'))`,
      [userId, role === 'Employee' ? 'Software Engineer' : 'HR Officer', 'General']
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email to activate your account.',
      data: {
        userId,
        employeeId,
        email: email.toLowerCase(),
        name,
        role,
        isVerified: false,
        // Provided token in development response for easy API testing
        verificationToken,
        verificationUrl: `/api/auth/verify-email?token=${verificationToken}`,
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email using token
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is missing from request.',
      });
    }

    const user = await getOne(
      'SELECT id, email, is_verified FROM users WHERE verification_token = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    if (user.is_verified === 1) {
      return res.status(200).json({
        success: true,
        message: 'Email address is already verified. You can proceed to log in.',
      });
    }

    // Mark as verified and clear verification token
    await run(
      'UPDATE users SET is_verified = 1, verification_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Email successfully verified! Your account is now active.',
    });
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during email verification.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/auth/signin
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user by email or employee_id
    const user = await getOne(
      'SELECT * FROM users WHERE email = ? OR employee_id = ?',
      [email.toLowerCase(), email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User does not exist.',
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    // Check email verification status
    if (user.is_verified !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your email before logging in.',
        verificationUrl: `/api/auth/verify-email?token=${user.verification_token}`,
      });
    }

    // Generate JWT payload
    const tokenPayload = {
      id: user.id,
      employeeId: user.employee_id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Sign in successful!',
      data: {
        token,
        user: {
          id: user.id,
          employeeId: user.employee_id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: true,
        },
      },
    });
  } catch (error) {
    console.error('Error during sign in:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during sign in.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get logged in user profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const userProfile = await getOne(
      `SELECT u.id, u.employee_id, u.email, u.name, u.role, u.is_verified, u.created_at,
              p.phone, p.address, p.profile_picture, p.job_title, p.department, p.date_of_joining, p.salary_base
       FROM users u
       LEFT JOIN employee_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching user profile.',
      error: error.message,
    });
  }
};
