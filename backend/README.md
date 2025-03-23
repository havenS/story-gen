# Install 
- Install deps
```
$ npm install
```
- Copy .env.example to .env and update `DATABASE_URL`
- Create database
```
$ npx prisma migrate dev generate
```
- Run seeds
```
$ npm run seeds
```

# Swagger
Configure to fetch automatically the available routes.
Available on `/api`.
Ref for openAPI conf:
[Link](https://outside-studio.hashnode.dev/leverage-openapi-to-generate-a-strongly-typed-client-in-nestjs)

# Database
## Create a migration
After updating the Prisma schema:
```
$ npx prisma migrate dev --name [NAME]
```

# Youtube auth
- launch ngrok 
```
ngrok http --subdomain=jf-local 3001
```
- access auth page to go to login
[Login](https://jf-local.eu.ngrok.io/youtube/auth)