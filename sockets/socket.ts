import { Socket } from 'socket.io';
import socketIO from 'socket.io';
import { UsuariosLista } from '../classes/usuarios-lista';
import { Usuario } from '../classes/usuario';

import Server from '../classes/server';
import * as redis from 'redis';

export const usuariosConectados = new UsuariosLista();

let publisherClient: any;
let subscriberClient: any;
(async () => {
    publisherClient = redis.createClient({
        url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379',
    });
    publisherClient.connect().then(() => {
        console.log('Conectado en publisherClient');
        subscriberClient = publisherClient.duplicate();
        subscriberClient.connect().then(() => {
            console.log('Conectado en subscriberClient');
            subscriberClient.subscribe('usuario-nuevo', async (usuarios: any) => {

                Server.instance.io.emit('usuarios-activos', JSON.parse(usuarios));

            });

            subscriberClient.subscribe('marker-borrar', async (message: any) => {


            });

            subscriberClient.subscribe('usuario-mover', (usuario: any) => {
                Server.instance.io.emit('usuario-mover', JSON.parse(usuario));
            });
        });
    });

})();

export const conectarCliente = async (cliente: Socket, io: socketIO.Server) => {
    console.log('Cliente conectado: ', cliente.id);
}

export const desconectar = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('disconnect', async () => {
        console.log('Cliente desconectado: ', cliente.id);
        await usuariosConectados.borrarUsuario(cliente.id);
        const usuarios = await usuariosConectados.getLista();
        io.emit('usuarios-activos', usuarios);
        publisherClient.publish('usuario-nuevo', JSON.stringify(usuarios));
    });
}

// Escuchar login (configurar-usuario)
export const configurarUsuario = async (cliente: Socket, io: socketIO.Server) => {

    cliente.on('login-usuario',  async () => {

        const usuario = new Usuario(cliente.id);
        await usuariosConectados.agregar(usuario);

        const usuarios = await usuariosConectados.getLista();
        // io.emit('usuarios-activos', usuarios);
        publisherClient.publish('usuario-nuevo', JSON.stringify(usuarios));


        // callback({
        //     ok: true,
        //     mensaje: `Usuario configurado`,
        // });

    });

    cliente.on('configurar-usuario', async (payload: { nombre: string, lat: number, lng: number }, callback: Function) => {
        await usuariosConectados.actualizarNombre(cliente.id, payload.nombre, payload.lat, payload.lng);
        const usuarios = await usuariosConectados.getLista();
        // io.emit('usuarios-activos', usuarios);

        publisherClient.publish('usuario-nuevo', JSON.stringify(usuarios));

        callback({
            ok: true,
            mensaje: `Usuario ${payload.nombre} configurado`,
            server: (cliente as any).server.httpServer._connectionKey
        });
    });

    cliente.on('actualizar-ubicacion', async (user: { id: string, lat: number, lng: number}) => {
        await usuariosConectados.actualizarUbicacion(user.id, user.lat, user.lng);
        publisherClient.publish('usuario-mover', JSON.stringify(user));
        // cliente.broadcast.emit('actualizar-ubicacion', user);
    });

    cliente.on('desconfigurar-usuario', async (payload: {}, callback: Function) => {

        await usuariosConectados.borrarUsuario(cliente.id);
        const usuarios = await usuariosConectados.getLista();
        // console.log('emitiendo cerrar sesion', usuarios);
        // io.emit('usuarios-activos', usuarios);

        publisherClient.publish('usuario-nuevo', JSON.stringify(usuarios));

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
        // io.to(cliente.id).emit('usuarios-activos', await usuariosConectados.getLista());
        // Devolver el listado de usuarios a todo el mundo
        io.emit('usuarios-activos', await usuariosConectados.getLista());
    });
}
