export type ConfigTypes = {
  env: string;
  port: number;
  apiDocs: string;
  store: {
    database: {
      postgres: IPostgres;
    };
  };
};

interface IPostgres {
  url: string;
  secureHost: string;
  testUrl: string;
}
