class Juego {

 constructor() {
    this.pixiApp;
    this.pixiInicializando = false;
    this.gameObjetcs = []
    this.teclado = {};
    this.ahora = performance.now();

    this.init();
 }

 async init(){
    this.pixiApp = new PIXI.Application();

    const opcionesDePixi = {
        background: "#627480",
        width: this.innerWidth,
        height: this.innerHeight,
    };

 await this.pixiApp.init(opcionesDePixi);

 document.body.appendChild(this.pixiApp.canvas);
    this.pixiInicializando = true;
    await this.precargarAssets();

    this.crearEventListeners();

    this.crearNivel();
 }

 crearEventListeners() {
   window.onkeydown = (evento) => {
      this.teclado[evento.key.toLowerCase()];
   };

   window.onkeyup = (evento) => {
      delete this.teclado[evento.key.toLowerCase()];
   };

 }

 async precargarAssets(){
   
 }

}
