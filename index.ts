import Server from './classes/server';
import { SERVER_PORT } from './global/environment';
import router from './routes/router';

const server = new Server();

server.app.use('/', router);

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${SERVER_PORT}`);
});
