# ---- Estágio 1: Builder ----
# Usa a imagem completa do Node para instalar dependências e compilar o projeto
FROM node:22.14.0 AS builder

# Define o argumento da porta
ARG PORT=7877

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package*.json ./

# Instala TODAS as dependências (incluindo as de desenvolvimento)
RUN yarn

# Copia o resto do código-fonte (respeitando o .dockerignore)
COPY . .

# Gera o cliente Prisma a partir do seu schema.prisma local (mais seguro)
RUN npx prisma generate

# Compila a aplicação para produção
RUN yarn build


# ---- Estágio 2: Runner ----
# Usa uma imagem mais leve do Node, pois não precisamos mais das ferramentas de build
FROM node:22.14.0 AS runner

ARG PORT
ENV PORT=${PORT}
ENV NODE_ENV=production

WORKDIR /app

# Copia o package.json para instalar apenas as dependências de produção
COPY --from=builder /app/package.json ./

# Instala APENAS as dependências de produção
RUN yarn install --production

# Copia os artefatos compilados do estágio de builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expõe a porta que a aplicação irá usar
EXPOSE ${PORT}

# O comando para iniciar a aplicação em produção
CMD ["yarn", "start"]