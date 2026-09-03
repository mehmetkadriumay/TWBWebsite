import fs from "node:fs";

export function loadLocalEnv() {
  if (typeof process.loadEnvFile === "function" && fs.existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
}

export function mysqlOptions() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    if (url.protocol !== "mysql:") {
      throw new Error("DATABASE_URL must use the mysql:// protocol.");
    }
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
      ssl:
        url.searchParams.get("ssl") === "true" ||
        process.env.DB_SSL === "true" ||
        process.env.MYSQL_SSL === "true"
          ? {}
          : undefined,
    };
  }

  const values = {
    host: process.env.DB_HOST ?? process.env.MYSQL_HOST,
    user: process.env.DB_USER ?? process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME ?? process.env.MYSQL_DATABASE,
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => `DB_${name.toUpperCase()}`);
  if (missing.length > 0) {
    throw new Error(
      `Missing MySQL configuration: ${missing.join(", ")}. Set DATABASE_URL or the DB_* variables.`,
    );
  }
  return {
    host: values.host,
    port: Number(process.env.DB_PORT ?? process.env.MYSQL_PORT ?? 3306),
    user: values.user,
    password: values.password,
    database: values.database,
    ssl:
      process.env.DB_SSL === "true" || process.env.MYSQL_SSL === "true"
        ? {}
        : undefined,
  };
}
