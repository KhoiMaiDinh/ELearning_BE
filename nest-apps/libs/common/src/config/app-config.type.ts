export type AppConfig = {
  nodeEnv: string;
  port: number;
  debug: boolean;
  logLevel: string;
  logService: string;
  corsOrigin: boolean | string | RegExp | (string | RegExp)[];
};
