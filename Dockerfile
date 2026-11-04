FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

FROM dependencies AS development

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM dependencies AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --from=dependencies /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=dependencies /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start"]
