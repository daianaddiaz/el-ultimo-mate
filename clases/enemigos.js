const EstadosEnemigos = Object.freeze({
    IDLE: "idle",
    WALK: "walk",
})

class Enemigo extends EntidadConEmocion {
    constructor(x, y, juego, opciones = {estadoInicial: "walk"}) {
        super(x,y,juego);

        this.id = juego.enemigos.length;
        this.tipo = enemigo;

        juego.enemigos.push(this);
        this.nombre = generateName();
        this.activo = false;
        this.juego = juego;
        this.dataJson = opciones.dataJson ?? juego.assetsCivil;
        this.emociones = []; //array de emociones posibles
        this.distanciaHastaBarra = 150;
        this.rapidezWalk = 1;

        this.enemigosCerca = [];
        this.mostrarEmocion = true;

        this.estado = opciones.estadoInicial ?? "idle";
        this.direccion = opciones.direccionInicial ?? "down";
        this.ultimoEstadoDeMovimiento = this.estado;

    }
}