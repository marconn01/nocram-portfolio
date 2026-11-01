import { httpServerHandler } from "cloudflare:node";
import app from "./server.js";

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Listening on ${PORT}`));

export default httpServerHandler({ port: 3000 });
