import Server from './classes/server';
import { SERVER_PORT } from './global/environment';
import router, { mapaGoogleMaps } from './routes/router';
import bodyParser from 'body-parser';
import cors from 'cors';

const server = Server.instance;

// BodyParser
server.app.use(bodyParser.urlencoded({ extended: true }));
server.app.use(bodyParser.json());

// CORS
server.app.use(cors({ origin: true, credentials: true }));

// Rutas de servicios
server.app.use('/', router);

// REDIS
// import * as redis from 'redis';
// let subscriberClient: any;
// (async () => {
//     subscriberClient = redis.createClient();
//     // subscriberClient.on('error', (err: any) => console.log('Redis Client Error', err));
//     await subscriberClient.connect();
// })();
// subscriberClient.subscribe('marker-nuevo', (message: any) => {
//     console.log('Evento redis: ', message);
//     mapaGoogleMaps.agregarMarcador(JSON.parse(message));
//     console.log('listado de markers: ', mapaGoogleMaps.getMarcadores());
// });
// REDIS

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${SERVER_PORT}`);
});
