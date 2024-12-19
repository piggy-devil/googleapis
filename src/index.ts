import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleCreateFile, handleDeleteFile } from "../routes/drive/route";
import { handleCreateFolder, handleDeleteFolder } from "../routes/folder/route";

const app = new Hono();

// Enable CORS
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "DELETE"] }));

app.get("/", (c) => c.text("Drive API!"));

app.post("/api/drive/create", handleCreateFile);
app.delete("/api/drive/delete", handleDeleteFile);

app.post("/api/folder/create", handleCreateFolder);
app.delete("/api/folder/delete", handleDeleteFolder);

// export default {
//   port: 8787,
//   fetch: app.fetch,
// };

export default app;
