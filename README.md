# API service for Liqdnft API

## Culture
- We are team of passionated software developers and we have our own git management guideline, visit our [Git guideline](./doc/git-convention.md)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/) are welcome
- We use Jira for *TMS* purpose as well, here is our [kanban board](https://fantohm.atlassian.net/jira/software/c/projects/FTM/issues)

## Documentation

* [Swagger on staging server](https://usdb-nft-lending-backend.herokuapp.com/doc/)

## Deployment Guideline
* [Deployment](./doc/deployment.md)

## Technical Stacks

* [PostgreSQL](https://www.postgresql.org/)
* [Node.js](https://nodejs.org/en/)
* [Nest.js](https://nestjs.com/)

### Database Configuration

Configure DATABASE_URL in .env file.
```
DATABASE_URL = postgres://[USER_NAME]:[PASSWORD]@[DOMAIN]:[PORT_NUMBER]/[DATABASE_NAME]
```

##### Example

```
DATABASE_URL = postgres://root:root@localhost:5432/liqdnft
```

### Migrations
* Run typeorm CLI, see detailed doc [here](https://typeorm.io/#/using-cli)
```
$ npm run typeorm <additional-commands>
```
* Create a new migration
```
$ npm run migration:generate --name=<migration-name> # We recommend to use Pascal Case for migration
```
* Run migration manually
```
$ npm run typeorm:run
```

### Nginix Configuration
* Return static website(Single Page Application) when curl [production server domain](https://liqdnft.com)
* Redirect localhost:3000 (Nest Backend Application) to [production backend](https://liqdnft.com/api)
* Redirect http to https
* Redirect IP address to https
```
server {
    listen 80;
    server_name liqdnft.com www.liqdnft.com;

    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location / {
	    return 301 https://liqdnft.com$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name liqdnft.com www.liqdnft.com;

    ssl    on;
    ssl_certificate    /home/<username>/liqdnft_com.crt;
    ssl_certificate_key    /home/<username>/liqdnft_com.key;

    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location /api {
	   proxy_pass http://localhost:3000/api;
    }

    location /doc {
	   proxy_pass http://localhost:3000/doc;
    }

    root /home/<username>/liqdnft-front/dist/liqdnft-front;

    location / {
	   try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name <ip-address>;

    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location / {
	    return 301 $scheme://liqdnft.com$request_uri;
    }
}
```

## Development

```bash
$ npm install

# run server in watch mode
$ npm run start:dev

# build in production mode
$ npm run start:staging
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>
