export class GraficaDataEncuesta {

    private preguntas: string[] = ['Pregunta 1', 'Pregunta 2', 'Pregunta 3', 'Pregunta 4'];
    private valores: number[] = [0, 0, 0, 0];

    constructor() { }

    getDataGraficaEncuesta() {
        return [
            { data: this.valores, label: 'Preguntas' }
        ];
    }

    incrementarValorPreguntas(pregunta: number, valor: number) {
        if (pregunta >= 0 && pregunta < this.preguntas.length) {
            this.valores[pregunta] += valor;
        }
        return this.getDataGraficaEncuesta();
    }

}
