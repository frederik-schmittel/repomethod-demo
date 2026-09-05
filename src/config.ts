export interface ServerConfig {
  host: string;
  port: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = Number(env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`invalid PORT: ${env.PORT}`);
  }
  return {
    host: env.HOST ?? "0.0.0.0",
    port,
  };
}
