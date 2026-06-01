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

        this.spritesAnimados = {
            idle: {},
            walk: {},           
        };

    this.listaDeSprites = [];
    this.sprite = null;

    this.estatico = false;

    this.friccion = 0.9;
    this.nodoDelCaminoActual = 0;
    this.asignarTarget(this.juego.nivel.nodosDelCamino[0])

    this.cargarSpritesAnimados(this.dataJson);
    this.spriteSplat = this.crearSpriteSplat(juego.assetsSplat);
    this.cambiarAnimacion(this.estado, this.direccion);
    
    this.crearFSMparaComportamientos();
    
    this.render();
}

asignarTarget(obj) {
    this.objTarget = obj;
    this.targetX = obj.x;
    this.targetY = obj.y;
  }

activar() {
    this.activo = true;
  }

desactivar() {
    this.activo = false;
  }

resetear() {
    this.desactivar();
    this.nodoDelCaminoActual = 0;
    this.asignarTarget(this.juego.nivel.nodosDelCamino[0]);
    this.cambiarAnimacion(this.estado, this.direccion);
  }

crearSpriteAnimado(frames, nombre, opciones = {}) {
    const spriteAnimado = new PIXI.AnimatedSprite(frames);

    spriteAnimado.label = nombre;
    spriteAnimado.visible = false;
    spriteAnimado.loop = opciones.loop ?? true;
    spriteAnimado.animationSpeed = opciones.animationSpeed ?? 0.12;
    spriteAnimado.scale.set(opciones.scale ?? 1);
    this.configurarOrigen(spriteAnimado);
    spriteAnimado.play();

    spriteAnimado.onComplete = () => {
      if (!spriteAnimado.loop) {
        this.cambiarAnimacion("idle", this.direccion);
      }
    };

    this.listaDeSprites.push(spriteAnimado);
    this.container.addChild(spriteAnimado);

    return spriteAnimado;
  }

}
