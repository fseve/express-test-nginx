import { Usuario } from './usuario';

import * as redis from 'redis';

export class UsuariosLista {

    redisController: any;

    constructor() {
        // RedisController

        this.redisController = redis.createClient({
            url: 'redis://default:8JkzNfVsbOWiPQ1QeqARhlGztUFGzXO8iAzCaB3M6Es=@llevaloo-redi.redis.cache.windows.net:6379',
        });
        this.redisController.connect().then(() => {
            console.log('conectado en redisController');
        });
    }

    // Agregar un usuario
    public async agregar(usuario: Usuario) {

        const usuarios = await this.getLista();

        usuarios.push({
            ...usuario
        });

        await this.redisController.set('usuarios', JSON.stringify(usuarios));
    }

    // Actualizar nombre de usuario
    public async actualizarNombre(id: string, nombre: string, lat: number, lng: number) {
        const lista = await this.getLista();
        for (let usuario of lista) {
            if (usuario.id === id) {
                usuario.nombre = nombre;
                usuario.lat = lat;
                usuario.lng = lng;
                usuario.status = true;
                break;
            }
        }
        await this.redisController.set('usuarios', JSON.stringify(lista));
    }

    // Obtener lista de usuarios
    public async getLista(): Promise<Usuario[]> {
        let usuarios = await this.redisController.get('usuarios');
        usuarios = JSON.parse(usuarios);

        if (usuarios !== null) {
            return usuarios;
        }
        return [];
    }

    // Borrar un usuario (Desconexión de una lista)
    public async borrarUsuario(id: string) {
        const lista = await this.getLista();
        console.log('antes de borrar: ', lista);

        const listaTemp = lista.filter(x => x.id !== id);

        console.log('despues de borrar: ', listaTemp);
        await this.redisController.set('usuarios', JSON.stringify(listaTemp));
        return listaTemp;
    }

    public actualizarUbicacion(user: { id: string, lat: number, lng: number}) {
    }

}
