#Definir imagem base
FROM node:lts-alpine

#Cria path para node_modules e dá permissão necessária
RUN mkdir -p /home/node/api/node_modules

#Setando diretório padrão
WORKDIR /home/node/api

#Copia package.json e arquivos yarn para container
COPY package.json yarn.* tsconfig.json ./

#Instalar dependências básicas
RUN yarn

#Copiar restante do código especificando o usuário
COPY  . .

#Expõe a porta
EXPOSE 3333

#Executa os comandos abaixo
CMD ["yarn", "start"]
