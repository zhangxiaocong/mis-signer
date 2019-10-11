# Mist Signer

## Getting Started

---------------

```sh

# mangodb for did
brew install mongodb
mongod --dbpath '~/data/db'

# postgres db for engine
docker-compose up db

# Install dependencies
npm install

# Start development live-reload server
PORT=6666 npm run dev

# Start production server:
PORT=8080 npm start
```

## Docker Support

```sh

# Build your docker
docker build -t mist/api-service .
#            ^      ^           ^
#          tag  tag name      Dockerfile location

# run your docker
docker run -p 8080:8080 mist/api-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```

## DID & Union Bank

冷存储
分布于多个国家的多签方案
私钥永不接触公网
转出地址白名单机制

热储存
运维人员永远不接触私钥
自动化多地多签方案
确保私钥安全前提下的即时存取
冷热存储池之间智能风控
可定制的提币限额、白名单
可定制的角色、审批流程
批量打币、入账提醒、流水对账
资产报告和审计追踪
