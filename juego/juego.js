import { Persona } from '../clases/persona.js';
import { GameObject } from '../clases/gameObject.js';

export class Juego {
    constructor(opciones = {}) {
        this.opciones = opciones;
        this.colorDeFondo = opciones.background ?? "#ffff00";
        this.app = null;
        this.ui = null;
        this.assetsCivil = null;
        this.assetsSplat = null;
        this.texturas = {};
        this.ultimoFrameRenderizado = performance.now();
        
        //un array para cada tipo de objeto

        this.GameObject = [];
        this.cebador = [];
        this.pava = [];
        this.personas = [];
        this.barra = [];

        this.timer = null;

        this.pixiInicializado = false;
        this.teclas = {};

        this.deltaTimeRatio = 1;
        this.fps = 60;
        this.numeroDeFrame = 0;
        this.pausado = false;

        this.usuario = new this.usuario();
        this.apretoBotonParaCebar = null;

        this.nivel = new Nivel(this);
        
    }

    async init() {
        if(this.pixiInicializado) {
            console.log("no podes volver a comenzar pixi")
            return;
        }    

        await this.inicializarAplicacionPixi();
        this.configurarOrdenamientoDelStage();
        this.registrarAppGlobalParaDepuracion();
        this.agregarCanvasEnBody();

        await this.cargarAssets();

        this.crearContainerPrincipal();
        this.agregarFondoDelMundo();
        this.spawnCentroUrbano();

        this.crearInterfazUsuario();
        this.registrarEventosDeEntrada();
        this.pixiInicializado = true;
        this.iniciarBucleDeJuego();
  }


async inicializarAplicacionPixi() {
    this.app = new PIXI.Application();
    await this.app.init(this.obtenerOpcionesDeInicializacionPixi());
  }

configurarOrdenamientoDelStage() {
    this.app.stage.sortableChildren = true;
  }

registrarAppGlobalParaDepuracion() {
    window.__PIXI_APP__ = this.app;
  }

agregarCanvasEnBody() {
    document.body.appendChild(this.app.canvas);
    document.body.style.margin = "0px";
    document.body.style.overflow = "hidden";
  }

crearContainerPrincipal() {
    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.sortableChildren = true;
    this.containerPrincipal.x = Math.round(
      (window.innerWidth - MUNDO_ANCHO) / 2,
    );
    this.containerPrincipal.y = Math.round(
      (window.innerHeight - MUNDO_ALTO) / 2,
    );
    this.app.stage.addChild(this.containerPrincipal);
  } 
  
  agregarFondoDelMundo() {
    const texturaBg = this.texturas["bg"];
    const fondo = new PIXI.Sprite({
      texture: texturaBg,
      width: MUNDO_ANCHO,
      height: MUNDO_ALTO,
    });
    fondo.zIndex = -1;
    this.containerPrincipal.addChild(fondo);
  }

crearInterfazUsuario(){
    this.ui = new UIHTML(this);
}

registrarEventosDeEntrada() {
    this.gameloop = this.gameloop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("click", this.onClick);
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("mousemove", this.onMouseMove);
  }

iniciarBucleDeJuego(){
    this.ultimoFrameRenderizado = performance.now();
    this.gameloop();
  }

async cargarAssets(){
    this.assetProtagonista = await PIXI.Assets.load("../spritesheets/prota.json");
    this.assetEstudiante= await PIXI.Assets.load("../spritesheets/estudiante.json"); 
    this.assetTrabajador = await PIXI.Assets.load("../spritesheets/trabajador.json");
    this.assetVecina =  await PIXI.Assets.load("../spritesheets/vieja-chusma.json");
    this.assetOficinista = await PIXI.Assets.load("../spritesheets/oficinista.json");

    const imagenes = {
        fondoTimer: "../spritesheets/fondo_timer.png",
        emojiAtencion: "../spritesheets/gif-emociones/atencion-deseo.gif",
        emojiBajaReputacion: "../spritesheets/gif-emociones/baja-reputacion.gif",
        emojiExcelente: "../spritesheets/gif-emociones/excelente.gif",
        emojiImpacincia: "../spritesheets/gif-emociones/impaciencia.gif",
        emojiMuyBien: "../spritesheets/gif-emociones/muy-bien.gif",
        botonMate: "../spritesheets/Mate_Boton.png",
        bg: "../background/background.png",
        pantallaInicio: "../background/pantalla inicio sin acordeon.png",
        fondoTimer: "../spritesheets/fondo_timer.png",
    };
    
    const entradas = Object.entries(imagenes);

    await Promise.all(
        entradas.map(async ([nombre, ruta])=>{
            const textura = await PIXI.Assets.load(ruta);
            this.texturas[nombre] = textura;
        }),
    );
}   

agregarGameObject(GameObject){
    this.containerPrincipal.addChild(gameObject.container);
    gameObject.render();

    return gameObject;
}    

spawnPersonas(x, y, opciones = {}) {
    const tipo = opciones.tipo ?? "base";
    const ClasePorTipo = {
      oficinista: Oficinista, //es el más rapido
      vecina: VecinaChusma, //tarda mas en tomar
      estudiante: Estudiante, 
      trabajador: Trabajador,
    };
    const Clase = ClasePorTipo[tipo] ?? Ofinicista;
    const enemigo = new Clase(x, y, this, opciones);
    return this.agregarGameObject(enemigo);
  }


crearEscena() {
        const centroX = this.app.screen.width / 2;
        const centroY = this.app.screen.height / 2;

        // Fondo
        this.background = new GameObject(centroX, centroY);
        this.background.configurarSprite(new PIXI.Sprite(PIXI.Assets.get('fondo')));
        this.background.sprite.width = this.app.screen.width;
        this.background.sprite.height = this.app.screen.height;
        this.app.stage.addChild(this.background.sprite);

        // Barra
        this.barra = new GameObject(centroX, centroY);
        this.barra.configurarSprite(new PIXI.Sprite(PIXI.Assets.get('barra')));
        this.app.stage.addChild(this.barra.sprite);

        // Protagonista (Persona)
        this.prota = new Persona('protaAtlas', centroX, centroY, 4);
        
        const rangoX = this.barra.sprite.width / 2;
        const rangoY = this.barra.sprite.height / 2;
        
        this.prota.definirLimitesMapeo(
            centroX - rangoX,
            centroX + rangoX,
            centroY - rangoY,
            centroY + rangoY
        );
        this.app.stage.addChild(this.prota.sprite);
        this.entidades.push(this.prota);

        // Reporte de diagnóstico 
        console.log(`📍 Prota posicionado en X: ${this.prota.sprite.x}, Y: ${this.prota.sprite.y}. Rango permitido X: ${centroX - rangoX} a ${centroX + rangoX}`);

        // 4. Timer HUD
        this.hudTimer = new PIXI.Container();
        this.hudTimer.x = centroX;
        this.hudTimer.y = 40;

        const fondoTimerSprite = new PIXI.Sprite(PIXI.Assets.get('fondoTimer'));
        fondoTimerSprite.anchor.set(0.5);
        this.hudTimer.addChild(fondoTimerSprite);

        this.textoReloj = new PIXI.Text({
            text: '06:00 AM',
            style: { fontFamily: 'sans-serif', fontSize: 22, fill: 0x0000, fontWeight: 'bold' }
        });
        this.textoReloj.anchor.set(0.5);
        this.hudTimer.addChild(this.textoReloj);
        this.app.stage.addChild(this.hudTimer);

        //Botón Mate
        this.botonMate = new PIXI.Sprite(PIXI.Assets.get('mate'));
        this.botonMate.anchor.set(0.5);
        this.botonMate.x = this.app.screen.width - 80;
        this.botonMate.y = this.app.screen.height - 80;
        
        this.botonMate.eventMode = 'static';
        this.botonMate.cursor = 'pointer';
        this.botonMate.on('pointerdown', () => this.cebar());
        this.app.stage.addChild(this.botonMate);
    };

manejarRelojMilitar(ticker) {
        this.tiempoActualSegundos += ticker.elapsedMS / 1000;

        if (this.tiempoActualSegundos >= this.duracionPartidaSegundos) {
            this.tiempoActualSegundos = this.duracionPartidaSegundos;
            this.textoReloj.text = "18:00 PM";
            return;
        }

        const porcentajeProgreso = this.tiempoActualSegundos / this.duracionPartidaSegundos;
        const horaActualCalculada = 6 + (porcentajeProgreso * 12);

        const horasEnteras = Math.floor(horaActualCalculada);
        const minutosEnteros = Math.floor((horaActualCalculada - horasEnteras) * 60);

        const formatoHoras = horasEnteras.toString().padStart(2, '0');
        const formatoMinutos = minutosEnteros.toString().padStart(2, '0');
        const indicadorAmPm = horasEnteras < 12 ? 'AM' : 'PM';

        this.textoReloj.text = `${formatoHoras}:${formatoMinutos} ${indicadorAmPm}`;
    };

loop(ticker) {
        this.manejarRelojMilitar(ticker);
        for (const entidad of this.entidades) {
            entidad.update(ticker);
        }
    
}

};
