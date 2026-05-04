class GameObject {
    constructor(x, y, dataJson, juego) {
        this.juego = juego;
        this.container = new PIXI.Container();
        this.id = juego.GameObject.length;

        this.juego.GameObject(this);

        this.juego.pixiApp.stage.addChild(this.container);

        this.posicion = { x: x, y: y,};

        this.velocidad = {x: 0, y: 0,};

        this.aceleracion = {x: 0, y: 0,};
    }
}