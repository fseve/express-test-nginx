import { Socket } from 'socket.io';
import socketIO from 'socket.io';
import { UsuariosLista } from '../classes/usuarios-lista';
import { Usuario } from '../classes/usuario';
import { Mapa } from '../classes/mapa';
import { Marcador } from '../classes/marcador';
import { MarcadorGoogleMaps } from '../classes/marcador-googlemaps';
import { mapaGoogleMaps } from '../routes/router';

import Server from '../classes/server';
import * as redis from 'redis';

// Publisher
let publisherClient: any;
let subscriberClient: any;
let redisController: any;
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
                mapaGoogleMaps.agregarMarcador(JSON.parse(message));
                const servidor = Server;
                servidor.instance.io.emit('marcador-nuevo-googlemaps', JSON.parse(message));

                await redisController.set('marcadores', JSON.stringify(mapaGoogleMaps.getMarcadores()));

            });

            subscriberClient.subscribe('marker-borrar', async (message: any) => {
                mapaGoogleMaps.borrarMarcador(message);
                const servidor = Server;
                servidor.instance.io.emit('marcador-borrar-googlemaps', message);

                await redisController.set('marcadores', JSON.stringify(mapaGoogleMaps.getMarcadores()));

            });

            subscriberClient.subscribe('marker-mover', (message: any) => {
                mapaGoogleMaps.moverMarcador(JSON.parse(message));
                const servidor = Server;
                servidor.instance.io.emit('marcador-mover-googlemaps', JSON.parse(message));
            });
        });
    });

    // RedisController

    redisController = redis.createClient({
        url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379',
    });
    redisController.connect().then(() => {
        console.log('conectado en redisController');
    });

})();

export const usuariosConectados = new UsuariosLista();
export const mapa = new Mapa();

// Eventos de mapa de Google Maps
export const marcadorNuevoGoogleMaps = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('marcador-nuevo-googlemaps', async (marcador: MarcadorGoogleMaps) => {

        // REDIS
        console.log('marcadorNuevo redis');
        publisherClient.publish('marker-nuevo', JSON.stringify(marcador));
        // Guardar nuevo marcador en redis
        // REDIS

        // mapaGoogleMaps.agregarMarcador(marcador);
        // cliente.broadcast.emit('marcador-nuevo-googlemaps', marcador);
        // io.emit('marcador-nuevo-googlemaps', marcador);
    });
}

export const marcadorBorrarGoogleMaps = (cliente: Socket) => {
    cliente.on('marcador-borrar-googlemaps', (id: string) => {

        // REDIS
        console.log('borrarMarcador redis');
        publisherClient.publish('marker-borrar', id);
        // REDIS

        // mapaGoogleMaps.borrarMarcador(id);
        // cliente.broadcast.emit('marcador-borrar-googlemaps', id);
    });
}

export const marcadorMoverGoogleMaps = (cliente: Socket) => {
    cliente.on('marcador-mover-googlemaps', (marcador: MarcadorGoogleMaps) => {
        // REDIS
        console.log('moverMarcador redis');
        publisherClient.publish('marker-mover', JSON.stringify(marcador));
        // REDIS
        // mapaGoogleMaps.moverMarcador(marcador);
        // cliente.broadcast.emit('marcador-mover-googlemaps', marcador);
    });
}

// Eventos de mapa
export const mapaSockets = (cliente: Socket, io: socketIO.Server) => {
    // Escuchando los marcadores nuevos
    cliente.on('marcador-nuevo', (marcador: Marcador) => {
        mapa.agregarMarcador(marcador);
        // Emitir los marcadores a todos, menos a quien creó el marcador
        cliente.broadcast.emit('marcador-nuevo', marcador);
    });

    // Escuchando el marcador que se va a eliminar
    cliente.on('marcador-borrar', (id: string) => {
        mapa.borrarMarcador(id);
        // Emitir a todos los clientes el id del marcador que se eliminó
        // Menos al cliente que lo eliminó
        cliente.broadcast.emit('marcador-borrar', id);
    });

    // Escuchando el marcador que se va a mover
    cliente.on('marcador-mover', (nuevoMarcador: { id: string, lng: number, lat: number}) => {
        mapa.moverMarcador(nuevoMarcador);
        // Emitir a todos los clientes el marcador que se movió
        // Menos al cliente que lo movió
        cliente.broadcast.emit('marcador-mover', nuevoMarcador);
    });

}


export const conectarCliente = (cliente: Socket, io: socketIO.Server) => {
    console.log('Cliente conectado: ', cliente.id);
    // console.log('Datos: ', cliente);
    const usuario = new Usuario(cliente.id);
    usuariosConectados.agregar(usuario);
}

export const desconectar = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('disconnect', () => {
        console.log('Cliente desconectado: ', cliente.id);
        usuariosConectados.borrarUsuario(cliente.id);
        io.emit('usuarios-activos', usuariosConectados.getLista());
    });
}

// Escuchar mensajes
export const mensaje = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('mensaje', (payload: { de: string, cuerpo: string }) => {
        console.log('Mensaje recibido: ', payload);
        io.emit('mensaje-nuevo', payload);
    });
}

// Escuchar login (configurar-usuario)
export const configurarUsuario = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('configurar-usuario', (payload: { nombre: string, lat: number, lng: number }, callback: Function) => {
        console.log('Configurando usuario: ', payload);
        usuariosConectados.actualizarNombre(cliente.id, payload.nombre, payload.lat, payload.lng);
        io.emit('usuarios-activos', usuariosConectados.getLista());
        callback({
            ok: true,
            mensaje: `Usuario ${payload.nombre} configurado`,
            server: (cliente as any).server.httpServer._connectionKey
        });
    });
}

// Obtener usuarios
export const obtenerUsuarios = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('obtener-usuarios', () => {
        // Devolver el listado de usuarios al usuario que lo solicita
        // io.in(cliente.id).emit('usuarios-activos', usuariosConectados.getLista());
        io.to(cliente.id).emit('usuarios-activos', usuariosConectados.getLista());
        // Devolver el listado de usuarios a todo el mundo
        // io.emit('usuarios-activos', usuariosConectados.getLista());
    });
}