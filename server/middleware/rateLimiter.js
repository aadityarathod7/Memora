import rateLimit from 'express-rate-limit';

// General API rate limiter - 1000 requests per 15 minutes (relaxed for development)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Strict limiter for auth endpoints - 10 failed attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Password reset limiter - 5 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Entry creation limiter - 50 entries per hour (prevent spam)
export const entryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'You have reached the maximum number of entries per hour.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  entryLimiter
};
