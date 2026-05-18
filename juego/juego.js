import { Persona } from '../objetos/persona.js';
import { GameObject } from '../objetos/gameObject.js';

export class Juego {
    constructor() {
        this.app = new PIXI.Application();
        this.entidades = [];
        this.duracionPartidaSegundos = 180;
        this.tiempoActualSegundos = 0;
        
        // Exponer la instancia para depurar desde F12
        window.miJuego = this;
    }

    async arrancar() {
        await this.app.init({ width: 800, height: 600, backgroundColor: 0x101010 });
        document.body.appendChild(this.app.canvas);

        await this.cargarAssets();
        this.crearEscena();

        this.app.ticker.add((ticker) => this.loop(ticker));
    }

    async cargarAssets() {
        try {
            PIXI.Assets.add({ alias: 'fondo', src: '../background/background.png' });
            PIXI.Assets.add({ alias: 'barra', src: '../spritesheets/barra.png' });
            PIXI.Assets.add({ alias: 'fondoTimer', src: '../spritesheets/fondo_timer.png' });
            PIXI.Assets.add({ alias: 'mate', src: '../spritesheets/Mate_Boton.png' });
            PIXI.Assets.add({ alias: 'protaAtlas', src: '../spritesheets/prota.json' });

            await PIXI.Assets.load(['fondo', 'barra', 'fondoTimer', 'mate', 'protaAtlas']);
            console.log("Assets ok");
        } catch (error) {
            console.error("🚨 Error al cargar archivos:", error);
        }
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
    }

    cebar() {
        console.log("Aca cebamos");
    }

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
    }

    loop(ticker) {
        this.manejarRelojMilitar(ticker);
        for (const entidad of this.entidades) {
            entidad.update(ticker);
        }
    }
}