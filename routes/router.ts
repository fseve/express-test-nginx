import { Router, Request, Response } from 'express';
import Server from '../classes/server';
import { usuariosConectados, mapa } from '../sockets/socket';
import { GraficaData } from '../classes/grafica';
import { GraficaDataEncuesta } from '../classes/grafica-encuesta';
import { MapaGoogleMaps } from '../classes/mapa-googlemaps';
import { MarcadorGoogleMaps } from '../classes/marcador-googlemaps';

const router = Router();

// Mapa Google Maps
export const mapaGoogleMaps = new MapaGoogleMaps();
const lugares: MarcadorGoogleMaps[] = [
    // {
    //     id: '1',
    //     nombre: 'Udemy',
    //     lat: 37.784679,
    //     lng: -122.395936
    // },
    // {
    //     id: '2',
    //     nombre: 'Bahía de San Francisco',
    //     lat: 37.798933,
    //     lng: -122.377732
    // },
    // {
    //     id: '3',
    //     nombre: 'The Palace Hotel',
    //     lat: 37.788578,
    //     lng: -122.401745
    // }
];
mapaGoogleMaps.marcadores.push(...lugares);
// Get mapasgooglemaps
router.get('/mapagooglemaps', (req: Request, res: Response) => {
    res.json(mapaGoogleMaps.getMarcadores());
});


// Mapa
// const mapa = new Mapa();

// Get mapas
router.get('/mapa', (req: Request, res: Response) => {
    res.json(mapa.getMarcadores());
});

// Gráfica de ventas sección 7
const grafica = new GraficaData();

// Gráfica de encuesta sección 8
const graficaEncuesta = new GraficaDataEncuesta();

// Gráfica de ventas sección 7
router.get('/grafica', (req: Request, res: Response) => {

    res.json(grafica.getDataGrafica());

});

// Gráfica de encuesta sección 8
router.get('/grafica/encuesta', (req: Request, res: Response) => {

    res.json(graficaEncuesta.getDataGraficaEncuesta());

});

// Gráfica de ventas sección 7
router.post('/grafica', (req: Request, res: Response) => {

    const mes = req.body.mes;
    const unidades = Number(req.body.unidades);

    grafica.incrementarValor(mes, unidades);

    // const payload = {
    //     de,
    //     cuerpo
    // };
    const server = Server.instance;
    server.io.emit('cambio-grafica', grafica.getDataGrafica());

    res.json(grafica.getDataGrafica());

});

// Gráfica de encuesta sección 8
router.post('/grafica/encuesta', (req: Request, res: Response) => {

    const pregunta = Number(req.body.pregunta);
    const valor = Number(req.body.valor);

    graficaEncuesta.incrementarValorPreguntas(pregunta, valor);

    const server = Server.instance;
    server.io.emit('cambio-grafica-encuesta', graficaEncuesta.getDataGraficaEncuesta());

    res.json(graficaEncuesta.getDataGraficaEncuesta());

});

router.post('/mensajes', (req: Request, res: Response) => {

    const cuerpo = req.body.cuerpo;
    const de = req.body.de;

    const payload = {
        de,
        cuerpo
    };

    const server = Server.instance;

    server.io.emit('mensaje-nuevo', payload);

    res.json({
        ok: true,
        cuerpo,
        de
    });

});

router.post('/mensajes/:id', (req: Request, res: Response) => {

    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    const id = req.params.id;

    const payload = {
        de,
        cuerpo
    };

    const server = Server.instance;

    server.io.in(id).emit('mensaje-privado', payload);

    res.json({
        ok: true,
        cuerpo,
        de,
        id
    });

});

// Servicios para obtener todos los IDs de los usuarios
router.get('/usuarios', (req: Request, res: Response) => {
    const server = Server.instance;

    server.io.allSockets().then((clientes) => {
        res.json({
            ok: true,
            clientes: Array.from(clientes)
        });
    }).catch((err) => {
        res.json({
            ok: false,
            error: err
        });
    });
});

// Servicio para obtener usuarios y sus nombres
router.get('/usuarios/detalle', (req: Request, res: Response) => {

    res.json({
        ok: true,
        clientes: usuariosConectados.getLista()
    });

});

router.get('/', (req: Request, res: Response) => {

    res.json({
        ok: true,
        mensaje: 'Hola Mundo de Azure MV'
    });

});

export default router;
