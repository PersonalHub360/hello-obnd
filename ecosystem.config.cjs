// PM2 ecosystem configuration for Aurora (hello-obnd) Application
// This file manages the Node.js application process

module.exports = {
  apps: [{
    name: 'aurora-app',
    script: 'dist/index.js',
    interpreter: 'node',
    instances: 1,
    exec_mode: 'cluster',
    
    // Environment variables loaded via systemd EnvironmentFile
    // See aurora.service for environment configuration
    env_production: {
      NODE_ENV: 'production',
      PORT: 6000,
    },
    
    // Restart policy
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logging
    error_file: '/var/log/aurora/error.log',
    out_file: '/var/log/aurora/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart delay
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: false,
    listen_timeout: 10000,
  }]
};

