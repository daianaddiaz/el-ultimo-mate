class Juego {
    pixiApp;
    npcs = [];
    cebador;
    width;
    height;

 constructor() {
    this.width = innerWidth
    this.height = innerHeight
    this.initPIXI()
 }

 async initPIXI(){
    this.pixiApp = new PIXI.Application();

    const opcionesDePixi = {
        background: "#627480",
        width: this.width,
        height: this.height,
    };

 await this.pixiApp.init(opcionesDePixi);

 document.body.appendChild(this.pixiApp.canvas);

 }
}
