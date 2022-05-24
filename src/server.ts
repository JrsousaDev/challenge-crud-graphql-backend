import 'reflect-metadata';

import path from 'path';
import dotenv from 'dotenv';

import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';
import { UserResolver } from './resolvers/UserResolver';

import mongoose from 'mongoose';

dotenv.config();
mongoose.connect(process.env.MONGO_CONNECTION as string);

async function main () {
  const schema = await buildSchema({
    resolvers: [
      UserResolver
    ],
    emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
  });

  const server = new ApolloServer({
    schema,
  })

  const { url } = await server.listen();

  console.log(`Server running onn ${url}`)
}

main();