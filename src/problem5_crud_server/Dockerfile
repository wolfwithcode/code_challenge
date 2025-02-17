FROM node:20

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json yarn.lock ./
COPY .env ./.env
COPY prisma ./prisma/

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
