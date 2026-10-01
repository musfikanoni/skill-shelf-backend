// @ts-ignore - Bypassing TS name conflict between app.ts and app/ folder
import app from "./app";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Skill Shelf Backend is running on port ${PORT}`);
});