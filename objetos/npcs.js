class Persona extends GameObject{
    constructor(x, y, textures, i, juego) {
    super(x, y, textures, i, juego);

    this.dataJson = textures;
    this.distanciaParaLlegar = 60;
    this.distanciaParaEscaparmeDeLaPersonaQueMeAsusta = 140;

    this.velocidadMaxima = 3;
    this.direccion = "abajo";

    this.target = null;

    this.cargarSpritesAnimados(this.dataJson);

    if (!(this instanceof Protagonista)) {
      this.asignarTarget(this.juego.gameObjects[this.id - 1]);
    }

    this.asignarPersonaQueMeAsusta(this.juego.prota);

    
}
}