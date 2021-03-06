# Mist Signer

The Design of Mist Exchange Protocol is start from scratch. 
All the design is based on Asimov Blockchain and take good consider of decentrelized.

## Getting Started

```sh

# mangodb for did
brew install mongodb
mongod --dbpath '/Users/xxx/data/db'

# postgres db for engine
docker stop mist-dex-pg
docker rm mist-dex-pg
docker-compose up db

# Install dependencies
npm install

# Start development live-reload server
PORT=6666 npm run dev

# Start production server:
PORT=8080 npm start
```

## Init

```bash
source product.env
# MIST_MODE must be product or dev
cd  src/adex/models/ && make seed
cd -
cd  src/express/models/ && make seed
```

## clean data

```bash
0 * * * *  psql "host=pgm-wz9m1yb4h5g4sl7x127770.pg.rds.aliyuncs.com port=1433 dbname=product user=product password=myHzSesQc7TXSS5HOXZDsgq7SNUHY2" < /opt/mist-signer_fingo_dev2/src/adex/models/mist_tmp_clean.sql
```

## Code Style

Normally, Using camelCase:

* SomeClass
* ISomeInterface
* SomeGlobalFunction
* SomeClass.someFunction
* SomeClass.publicVariable
* SomeClass._privateVariable

Only using snake_case at:

* some_folder/some_file.ts
* api_router_name
* db_structure
* SOME_CONST

## TEST

cd test && mocha --timeout 10000 api.test.js

## Deploy

```bash
npm run build
pm2 start pm2-mist.config.js --only mist --env production
```

## Test K8S ENV

```bash
kubectl port-forward -n fingo svc/mysql 3306:3306
kubectl port-forward -n fingo svc/postgresql 5432:5432
kubectl port-forward -n fingo svc/fingo-redis-master 16379:6379
kubectl port-forward -n fingo svc/mist-mongodb 27017:27017

source k8s.env

yarn babel-node src
yarn babel-node src/adex_engine
yarn babel-node src/adex_launcher
yarn babel-node src/adex_watcher
yarn babel-node src/bridge_watcher
yarn babel-node src/express
yarn babel-node src/express_watcher

# build
yarn build

node dist
node dist/adex_engine
node dist/adex_launcher
node dist/adex_watcher
node dist/bridge_watcher
node dist/express
node dist/express_watcher
node dist/adex_ws
node dist/data_process


```bash
```

## 相关文档

* [部署测试流程](doc/deploy.md)
* [交易对管理](doc/market_manage.md)
