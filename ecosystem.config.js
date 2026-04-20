{
  "apps": [
    {
      "name": "food-bank-backend",
      "script": "server.js",
      "cwd": "/home/ec2-user/food-bank/backend",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 8080,
        "BACKEND_HOST": "0.0.0.0",
        "MONGODB_URI": "mongodb://3.108.155.142:27017/foodbank",
        "AI_BASE_URL": "http://3.108.155.142:5001"
      },
      "error_file": "/var/log/food-bank/error.log",
      "out_file": "/var/log/food-bank/out.log",
      "log_file": "/var/log/food-bank/combined.log",
      "time": true
    }
  ]
}
