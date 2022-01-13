module.exports = {
  apps : [
    {
      script: "./dist/index.js",
      watch: false,
      env_app1: {
        "name": "app1",
        "PORT": 3000,
        "NODE_ENV": "development"
      },
      env_app2: {
        "name": "app2",
        "PORT": 3001,
        "NODE_ENV": "production",
      },
      env_app3: {
        "name": "app3",
        "PORT": 3002,
        "NODE_ENV": "production",
      }
    }
  ]
}