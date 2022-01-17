// import { MarcadorGoogleMaps } from './marcador-googlemaps';

// export class MapaGoogleMaps {

//     public marcadores: MarcadorGoogleMaps[] = [];

//     constructor() { }

//     getMarcadores() {
//         return this.marcadores;
//     }

//     agregarMarcador(marcador: MarcadorGoogleMaps) {
//         const search = this.marcadores.find(x => x.lat === marcador.lat && x.lng === marcador.lng);
//         if (!search) {
//             this.marcadores.push(marcador);
//         }
//     }

//     borrarMarcador(id: string) {
//         this.marcadores = this.marcadores.filter(mark => mark.id !== id);
//         return this.marcadores;
//     }

//     moverMarcador(marcador: MarcadorGoogleMaps) {
//         for (const i in this.marcadores) {
//             if (this.marcadores[i].id === marcador.id) {
//                 this.marcadores[i].lat = marcador.lat;
//                 this.marcadores[i].lng = marcador.lng;
//                 break;
//             }
//         }
//     }

// }
