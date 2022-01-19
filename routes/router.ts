import { Router, Request, Response } from 'express';
import Server from '../classes/server';
import { usuariosConectados } from '../sockets/socket';

import * as redis from 'redis';

const router = Router();

// Servicios para obtener todos los IDs de los usuarios
router.get('/usuarios', (req: Request, res: Response) => {
    const server = Server.instance;

    server.io.allSockets().then(async (clientes) => {
        res.json({
            ok: true,
            usuariosSockets: Array.from(clientes),
            usuariosConectados: await usuariosConectados.getLista()
        });
    }).catch((err) => {
        res.json({
            ok: false,
            error: err
        });
    });
});


router.get('/', (req: Request, res: Response) => {

    let redisController: any;
    (async () => {
        // RedisController

        redisController = redis.createClient(
            {
                url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379',
            }
        );

        redisController.on('error', (err: any) => console.log('Error en router.ts', err));

        redisController.connect().then(() => {
            console.log('conectado en redisController');
        });

        await redisController.del('marcadores');
        await redisController.del('usuarios');

    })();

    res.json({
        ok: true,
        mensaje: 'Hola Mundo de Azure MV'
    });

});

export default router;
