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

## API Swagger

There's no swagger, for the moment.
We still have created this table to help you understand the API :

**ALL** the response will follow the same schema :

```json
{
    success: boolean;
    statusCode: number;
    message: string;
    data: any;
    pagination?: {
        totalItems: number;
        totalPages: number;
        pageSize: number;
        currentPage: number;
    }
}
```

> **NOTE** : The `pagination` field will only be present if the response is paginated

> **NOTE 2** : Some routes will require a token to be passed in the header, to be authenticated, you can get a token by logging in
> that token will be valid for 10 minutes and will contain the user's id and username
> Each user have roles and some routes will require a specific role to be accessed

### Levels

> Levels are scinded in 4 parts :
>
> - **Campaign** _focused on the story_
> - **Online**
> - **Create** _focused on the creation of the online levels_

#### Campaign

| Method | Route                            | Description                               | Body                                              | Data return type                                           | Pagination |
| ------ | -------------------------------- | ----------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| GET    | /level/campaign                  | Get a preview of all campaign levels      |                                                   | [CampaignPreviewResponse\[\]](./src/@types/ApiResponse.ts) | Yes        |
| GET    | /level/campaign/:id              | Get a specific campaign level             |                                                   | [CampaignData](./src/@types/Map.ts)                        |            |
| GET    | /level/campaign/completion/check | Check if all levels are completed         |                                                   | boolean                                                    |            |
| PUT    | /level/campaign/completion       | Update the completion of a campaign level | [CampaignMapCompletion](./src/schema/campaign.ts) | integer                                                    |            |
| PUT    | /level/campaign                  | Create a new campaign level (Admin only)  | [CampaignData](./src/@types/Map.ts)               |                                                            |            |

#### Online

| Method | Route                    | Description                              | Body                                                | Data type                                                  | Pagination |
| ------ | ------------------------ | ---------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| GET    | /level/online            | Get a preview of all uploaded levels     |                                                     | [GetAllUploadSuccessResponse](./src/@types/ApiResponse.ts) | Yes        |
| GET    | /level/online/:id        | Get a specific uploaded level            |                                                     | [OnlineMap](./src/@types/db/OnlineMap.ts)                  |            |
| PUT    | /level/online            | Upload a new level                       | [onlineDataSchema](./src/schema/map.ts)             |                                                            |            |
| POST   | /level/online/completion | Update the completion of an online level | [OnlineMapCompletionSchema](./src/schema/online.ts) |                                                            |            |

#### Create

| Method | Route                   | Description                         | Body | Data type                                                      | Pagination |
| ------ | ----------------------- | ----------------------------------- | ---- | -------------------------------------------------------------- | ---------- |
| GET    | /level/create           | Get a preview of all created levels |      | [GetCreatePreviewSuccessResponse](./src/@types/ApiResponse.ts) | Yes        |
| GET    | /level/create/:username | Get all levels created by a user    |      | [GetAllUploadSuccessResponse](./src/@types/ApiResponse.ts)     | Yes        |
| GET    | /level/create/:id       | Get a specific online level         |      | [OnlineMap](./src/@types/db/OnlineMap.ts)                      |            |
| DELETE | /level/create/:id       | Delete a specific online level      |      |                                                                |            |
