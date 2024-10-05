import * as dotenv from 'dotenv';
import { schema } from './schema';
import { Validate } from './validators';
import { ConfigTypes } from '../types';
import { ConfigFactory } from '@nestjs/config';

dotenv.config();

// validate environment variables
const envVarsSchema = Validate(schema);
const { error, value: envVariables } = envVarsSchema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

const configFunction: ConfigFactory<ConfigTypes> = (): ConfigTypes => ({
  env: envVariables.NODE_ENV,
  port: Number(envVariables.PORT),
  apiDocs: envVariables.API_DOCS,
  store: {
    database: {
      postgres: {
        url: envVariables.DATABASE_URL,
        secureHost: envVariables.DATABASE_URL,
        testUrl: envVariables.DATABASE_URL,
      },
    },
  },
});

export const config = configFunction;
