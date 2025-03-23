import { Configuration, DefaultApi } from "./api-client";

const config = new Configuration({
  basePath: "http://localhost:3001",
});

export const api = new DefaultApi(config);
