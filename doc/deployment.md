# Deployment Guide

## Prerequisites
* [Node](https://nodejs.org/)
* [pm2](https://pm2.keymetrics.io/)
* [git](https://git-scm.com/)
* [npm](https://www.npmjs.com/)
* [postgresql](https://www.postgresql.org/)

## Installation Steps
#### 1. Launch an Ubuntu 20.04 server EC2 instance.
#### 2. Install prerequisites.
```bash
sudo apt update
sudo apt install git
sudo apt install npm
sudo npm install -g n
sudo n 16.15.0
sudo npm install -g pm2
sudo apt install postgresql postgresql-contrib
```
#### 3. Configure postgresql
* create root a user and set password
```bash
$ sudo -i -u postgres
$ psql postgres postgres
postgres=# create user root;
postgres=# alter user root with password 'root';
postgres=# alter user postgres with password 'postgres';
postgres=# exit
```
* change postgresql connect option
Use vim or other text edit tool to edit `/etc/postgresql/12/main/pg_hba.conf`.<br>
Find this part in the file and modify `peer` to `md5`.
```
local   all    all                                      peer
```
Should look like
```
local   all    all                                      md5
```
* restart postgres service
```
sudo service postgresql restart
```
* initialize db
```
sudo -u postgres psql
postgres=# create database liqdnft;
postgres=# alter database liqdnft owner to root;
postgres=# \c liqdnft
postgres=# create extension "uuid-ossp";
```

#### 4. Clone repository
Clone `usdb-nft-lending-backend` repository to home directory(`/home/<username>/`).
```
git clone git@github.com:FantOHM-DAO/usdb-nft-lending-backend.git
```

#### 5. Configure pm2 environment
* build project for first use
```
cd /home/<username>/usdb-nft-lending-backend
git pull
npm run build
```
* make pm2 entry
```
cd /home/<username>/usdb-nft-lending-backend
sudo pm2 start dist/main.js -n usdb-nft-lending-backend-api
sudo pm2 startup
sudo pm2 save
```

The production server is up now and github action will execute deploy script once there is any update in `staging` branch.

## Troubleshooting
#### How to restart server instance?
```
sudo pm2 restart usdb-nft-lending-backend-api
```

