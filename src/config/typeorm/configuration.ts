/* eslint-disable prettier/prettier */
/* eslint-disable n/no-path-concat */

export default () => ({
  port: parseInt(process.env.PORT || "", 10) || 3003,
  database: {
    type: "mysql",
    host: process.env.DB_HOST || process.env.DB_HOST_LOCAL,
    cache: true,
    port: parseInt(process.env.DB_PORT || "", 10) || 3306,
    username: process.env.DB_USERNAME || process.env.DB_USERNAME_LOCAL,
    password: process.env.DB_PASSWORD || process.env.DB_PASSWORD_LOCAL,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNC === "true",
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/database/migrations/**/*{.ts,.js}"],

    migrationsRun: true,
    autoLoadEntities: true,
    logging: process.env.DB_LOGGING !== "false",
    ssl:
      process.env.NODE_ENV !== "production"
        ? false
        : {
            rejectUnauthorized: false,
          },
    cli: {
      migrationsDir: __dirname + "/../database/migrations",
    },
    extra: {
      connectionLimit: 20, // Number of connections increased to improve parallel calls
    },
  },
});
