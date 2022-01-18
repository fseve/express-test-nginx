export class Usuario {

    public id: string;
    public nombre: string;
    public sala: string;
    public lat?: number;
    public lng?: number;
    public status?: boolean;

    constructor(id: string) {
        this.id = id;
        this.nombre = 'sin-nombre';
        this.sala = 'sin-sala';
        this.status = false;
    }

}
