module.exports = {
  apps: [
    {
      name: "task-management-api",
      cwd: "/home/lokman/projects/task-management",
      script: "dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5701
      },
      autorestart: true,
      max_memory_restart: "350M",
      kill_timeout: 5000,
      time: true
    }
  ]
};
