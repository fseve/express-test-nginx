import { Socket } from 'socket.io';
import socketIO from 'socket.io';
import { UsuariosLista } from '../classes/usuarios-lista';
import { Usuario } from '../classes/usuario';

// import Server from '../classes/server';
import * as redis from 'redis';

export const usuariosConectados = new UsuariosLista();


// Publisher
let publisherClient: any;
let subscriberClient: any;
// let redisController: any;
(async () => {
    publisherClient = redis.createClient({
        // // url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379'
        url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379',
    });
    publisherClient.connect().then(() => {
        console.log('Conectado en publisherClient');
        subscriberClient = publisherClient.duplicate();
        subscriberClient.connect().then(() => {
            console.log('Conectado en subscriberClient');
            subscriberClient.subscribe('marker-nuevo', async (message: any) => {


            });

            subscriberClient.subscribe('marker-borrar', async (message: any) => {


            });

            subscriberClient.subscribe('marker-mover', (message: any) => {

            });
        });
    });

    // // RedisController

    // redisController = redis.createClient({
    //     url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379',
    // });
    // redisController.connect().then(() => {
    //     console.log('conectado en redisController');
    // });

})();

// export const mapa = new Mapa();

// Eventos de mapa de Google Maps
// export const marcadorNuevoGoogleMaps = (cliente: Socket, io: socketIO.Server) => {
//     cliente.on('marcador-nuevo-googlemaps', async (marcador: MarcadorGoogleMaps) => {

//         // REDIS
//         console.log('marcadorNuevo redis');
//         publisherClient.publish('marker-nuevo', JSON.stringify(marcador));
//         // Guardar nuevo marcador en redis
//         // REDIS

//         // mapaGoogleMaps.agregarMarcador(marcador);
//         // cliente.broadcast.emit('marcador-nuevo-googlemaps', marcador);
//         // io.emit('marcador-nuevo-googlemaps', marcador);
//     });
// }

// export const marcadorBorrarGoogleMaps = (cliente: Socket) => {
//     cliente.on('marcador-borrar-googlemaps', (id: string) => {

//         // REDIS
//         console.log('borrarMarcador redis');
//         publisherClient.publish('marker-borrar', id);
//         // REDIS

//         // mapaGoogleMaps.borrarMarcador(id);
//         // cliente.broadcast.emit('marcador-borrar-googlemaps', id);
//     });
// }

// export const marcadorMoverGoogleMaps = (cliente: Socket) => {
//     cliente.on('marcador-mover-googlemaps', (marcador: MarcadorGoogleMaps) => {
//         // REDIS
//         console.log('moverMarcador redis');
//         publisherClient.publish('marker-mover', JSON.stringify(marcador));
//         // REDIS
//         // mapaGoogleMaps.moverMarcador(marcador);
//         // cliente.broadcast.emit('marcador-mover-googlemaps', marcador);
//     });
// }

// Eventos de mapa
// export const mapaSockets = (cliente: Socket, io: socketIO.Server) => {
//     // Escuchando los marcadores nuevos
//     cliente.on('marcador-nuevo', (marcador: Marcador) => {
//         mapa.agregarMarcador(marcador);
//         // Emitir los marcadores a todos, menos a quien creó el marcador
//         cliente.broadcast.emit('marcador-nuevo', marcador);
//     });

//     // Escuchando el marcador que se va a eliminar
//     cliente.on('marcador-borrar', (id: string) => {
//         mapa.borrarMarcador(id);
//         // Emitir a todos los clientes el id del marcador que se eliminó
//         // Menos al cliente que lo eliminó
//         cliente.broadcast.emit('marcador-borrar', id);
//     });

//     // Escuchando el marcador que se va a mover
//     cliente.on('marcador-mover', (nuevoMarcador: { id: string, lng: number, lat: number}) => {
//         mapa.moverMarcador(nuevoMarcador);
//         // Emitir a todos los clientes el marcador que se movió
//         // Menos al cliente que lo movió
//         cliente.broadcast.emit('marcador-mover', nuevoMarcador);
//     });

// }


export const conectarCliente = async (cliente: Socket, io: socketIO.Server) => {
    console.log('Cliente conectado: ', cliente.id);
}

export const desconectar = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('disconnect', async () => {
        console.log('Cliente desconectado: ', cliente.id);
        await usuariosConectados.borrarUsuario(cliente.id);
        io.emit('usuarios-activos', await usuariosConectados.getLista());
    });
}


// Escuchar login (configurar-usuario)
export const configurarUsuario = async (cliente: Socket, io: socketIO.Server) => {

    cliente.on('login-usuario',  async (payload: {}, callback: Function) => {

        const usuario = new Usuario(cliente.id);
        await usuariosConectados.agregar(usuario);

        const usuarios = await usuariosConectados.getLista();
        io.emit('usuarios-activos', usuarios);

        callback({
            ok: true,
            mensaje: `Usuario configurado`,
        });

    });

    cliente.on('configurar-usuario', async (payload: { nombre: string, lat: number, lng: number }, callback: Function) => {
        await usuariosConectados.actualizarNombre(cliente.id, payload.nombre, payload.lat, payload.lng);
        const usuarios = await usuariosConectados.getLista();
        io.emit('usuarios-activos', usuarios);

        callback({
            ok: true,
            mensaje: `Usuario ${payload.nombre} configurado`,
            server: (cliente as any).server.httpServer._connectionKey
        });
    });

    cliente.on('actualizar-ubicacion', async (user: { id: string, lat: number,  lng: number,}) => {
        usuariosConectados.actualizarUbicacion(user);
        // await redisController.set('usuarios', JSON.stringify(usuariosConectados.getLista()));
        cliente.broadcast.emit('actualizar-ubicacion', user);
    });

    cliente.on('desconfigurar-usuario', async (payload: {}, callback: Function) => {

        await usuariosConectados.borrarUsuario(cliente.id);
        const usuarios = await usuariosConectados.getLista();
        console.log('emitiendo cerrar sesion', usuarios);
        io.emit('usuarios-activos', usuarios);

        callback({
            ok: true,
            mensaje: 'El usuario ha cerrado sesión'
        });

    });

}

// Obtener usuarios
export const obtenerUsuarios = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('obtener-usuarios', async () => {
        // Devolver el listado de usuarios al usuario que lo solicita
        // io.in(cliente.id).emit('usuarios-activos', usuariosConectados.getLista());
        io.to(cliente.id).emit('usuarios-activos', await usuariosConectados.getLista());
        // Devolver el listado de usuarios a todo el mundo
        // io.emit('usuarios-activos', usuariosConectados.getLista());
    });
}