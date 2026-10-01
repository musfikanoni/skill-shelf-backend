import { env } from "./app/config/env";
import app from "./app";

app.listen(env.port, () => {
  console.log(`Skill Shelf Backend is running on port ${env.port}`);
});