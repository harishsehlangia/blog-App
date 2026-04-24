// Validate required environment variables at startup
const requiredEnvVars = [
    'DB_LOCATION',
    'SECRET_ACCESS_KEY',
    'AWS_ACCESS_KEY',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`\n❌ Missing required environment variables:\n`);
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error(`\nPlease add them to your .env file and restart.\n`);
    process.exit(1);
}

// Optional env vars with defaults
const optionalEnvVars = {
    PORT: process.env.PORT || '3000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

if (!process.env.FRONTEND_URL) {
    console.warn('⚠️  FRONTEND_URL not set — defaulting to http://localhost:5173');
}

export default optionalEnvVars;
