# 构建
FROM node:20.10.0-alpine3.17 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry http://registry.npmmirror.com/

RUN npm install 

COPY  . . 

RUN npm run build

# 生产
FROM node:20.10.0-alpine3.17 as production-build

ARG APP_ENV=production

ENV NODE_ENV=${APP_ENV}

WORKDIR /app

COPY --from=build-stage /app/dist/ ./dist/
COPY --from=build-stage /app/package.json ./
COPY --from=build-stage /app/secretKey ./secretKey

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install --only=--production

EXPOSE 3000

CMD node dist/src/main
