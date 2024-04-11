FROM node:16-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN pnpm install --prod

COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

FROM node:16-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN npm install -g pnpm

RUN pnpm install

COPY prisma/schema.prisma /app/prisma/schema.prisma

RUN pnpm dlx prisma generate

COPY . /app

EXPOSE 3000

# For production
# RUN pnpm run build
# CMD ["pnpm", "run", "start"]

# For development
CMD ["pnpm", "run", "dev"]