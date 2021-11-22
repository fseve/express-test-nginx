import { Socket } from 'socket.io';
import socketIO from 'socket.io';

export const desconectar = (cliente: Socket) => {
    cliente.on('disconnect', () => {
        console.log('Cliente desconectado');
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
    cliente.on('configurar-usuario', (payload: { nombre: string }, callback: Function) => {
        console.log('Configurando usuario: ', payload.nombre);
        callback({
            ok: true,
            mensaje: `Usuario ${payload.nombre} configurado`
        });
    });
}
