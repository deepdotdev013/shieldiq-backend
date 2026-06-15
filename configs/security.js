module.exports = {
  // CORS configuration
  cors: {
    origin: (origin, callback) => {
      // Allow all origins or specify certain domains
      if (
        !origin ||
        origin === 'http://localhost:3000' 
      ) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error('Not allowed by CORS')); // Reject the request
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['*'],
    credentials: true, // Allow credentials like cookies or authorization headers
  },

  // Helmet configuration for HTTP headers security
  helmet: {
    contentSecurityPolicy: false, // Set this to true to enforce a strict Content-Security-Policy
  },

  // Rate Limiting (optional, you can install and use a package like express-rate-limit)
  rateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
  },

  // XSS Protection - It's a good idea to have some mechanism to prevent XSS attacks
  xssProtection: {
    enable: true, // Enable XSS protection
    mode: 'block', // Block any detected attacks
  },

  // CSRF Protection (you can use a library like csurf)
  csrfProtection: {
    enable: true, // Enable CSRF protection
  },

  // SQL Injection Prevention (best to use ORM like Sequelize or query builders that prevent injections)
  sqlInjectionPrevention: {
    enable: true, // Enable prevention by using parameterized queries via Sequelize
  },
};
