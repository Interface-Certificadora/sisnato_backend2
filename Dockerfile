# Mesma versão de Node usada em produção no PM2 (v20.19.2)
ARG NODE_IMAGE=node:20.19.2-bookworm-slim

# -------------------------------------------------------
# Etapa 1: dependências de produção + Prisma Client
# -------------------------------------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 600000
COPY prisma ./prisma
RUN npx prisma generate

# -------------------------------------------------------
# Etapa 2: build da aplicação (com devDependencies)
# -------------------------------------------------------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY . .
RUN npx prisma generate && yarn build

# -------------------------------------------------------
# Etapa 3: imagem final, só o necessário para rodar
# -------------------------------------------------------
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates tzdata \
  && rm -rf /var/lib/apt/lists/*

# PORT e demais variáveis vêm do .env montado em /app/.env
ENV NODE_ENV=production \
  TZ=America/Sao_Paulo

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node prisma ./prisma
# Arquivos lidos em runtime via process.cwd() (fontes e imagens dos PDFs)
COPY --chown=node:node src/pdf_create/assets ./src/pdf_create/assets
COPY --chown=node:node src/api/intelesign/public ./src/api/intelesign/public

USER node
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3002/api').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main"]
