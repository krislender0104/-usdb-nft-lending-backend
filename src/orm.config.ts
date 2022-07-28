import * as postgresConnectionStringParser from 'pg-connection-string';
import { DataSource, DataSourceOptions } from 'typeorm';

console.log('process.env.DATABASE_URL: ', process.env.DATABASE_URL);

const connectionOptions = postgresConnectionStringParser.parse(
  process.env.DATABASE_URL,
);

// Check typeORM documentation for more information.
export const connectionSource = new DataSource({
  migrationsTableName: 'migrations',
  type: 'postgres',
  host: connectionOptions.host,
  port: Number(connectionOptions.port),
  username: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  // We are using migrations, synchronize should be set to false.
  synchronize: true,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: false,
  logging: false,
  logger: 'file',

  migrations: ['src/migrations/*.ts'],
} as DataSourceOptions);
