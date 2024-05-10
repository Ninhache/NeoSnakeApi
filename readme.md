# SnakeAPI

> Before setup, make sure you have `docker` installed on your machine
> If you don't, that's not important, instead of using the local api, you can use the deployed one at `snakedev.ninhache.fr`
> That way the api will be already setup and you can focus on the front-end part
> _Just be sure the front's .env is set to the right url_

## Installation & Setup

**First** clone the repo :

```bash
git clone [..] SnakeAPI
cd SnakeAPI
yarn
```

---

**Then** you need to create a `.env` file at the root of the project with the following skeleton :

```bash
PORT=8080

POSTGRES_DB=____
POSTGRES_USER=____
POSTGRES_PASSWORD=____

JWT_SECRET=____
```

> **NOTE** : You can generate a **JWT_SECRET** using the following command :
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

You **finally** need to create the docker container through the following commands :

> _You need to replace the `[...]` by the appropriate values_

```bash
docker build -t [image-name] .
docker network create [network-name]
docker run -d --network [network-name] --name [container-name] --env-file ./.env -p 5432:5432 [image-name]
```

You can access the database using :

```bash
docker run -it --rm --network [network-name] postgres psql -h [container-name] -U [user-name] -d [database-name]
```

## Run the project

Once the database is up and running, you can run the project.

```bash
yarn dev # for development
yarn prod # for production
```
