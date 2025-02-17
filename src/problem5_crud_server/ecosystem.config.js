// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apps: [
    {
      name: 'app',
      script: 'build/src/index.js',
      instances: 1,
      autorestart: true,
      max_restarts: 3,
      watch: process.env.NODE_ENV === 'development',
      time: true,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development'
      }
    }
  ]
};
