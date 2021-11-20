import Server from "./classes/server";
import { SERVER_PORT } from "./global/environment";

const server = new Server();

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${SERVER_PORT}`);
});
