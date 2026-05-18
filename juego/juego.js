import { GameObject } from '../objetos/gameObject.js';
import { Persona } from '../objetos/Persona.js';

export class Juego {
    constructor() {
        this.app = new PIXI.Application();
        this.entidades = [];
        this.duracionPartidaSegundos = 180; // 3 minutos reales
        this.tiempoActualSegundos = 0;
    }

    async arrancar() {
        // 1. Inicializamos la app de Pixi
        await this.app.init({ width: 800, height: 600, backgroundColor: 0x101010 });
        document.body.appendChild(this.app.canvas);

        // 2. Primero cargamos los assets de forma asíncrona
        await this.cargarAssets();

        // 3. Con las texturas listas en caché, armamos la escena
        this.crearEscena();

        // 4. Encendemos el loop principal
        this.app.ticker.add((ticker) => this.loop(ticker));
    }

    async cargarAssets() {
        // Mapeamos los alias limpios a tus archivos PNG locales
        PIXI.Assets.add({ alias: 'fondo', src: '../background/background.png' });
        PIXI.Assets.add({ alias: 'prota', src: '../spritesheets/prota.png' });
        PIXI.Assets.add({ alias: 'barra', src: '../spritesheets/barra.png' });
        PIXI.Assets.add({ alias: 'fondoTimer', src: '../spritesheets/fondo_timer.png' });
        PIXI.Assets.add({ alias: 'mate', src: '../spritesheets/Mate_Boton.png' });

        // Esperamos que se complete la descarga de todo
        await PIXI.Assets.load(['fondo', 'prota', 'barra', 'fondoTimer', 'mate']);
    }

    crearEscena() {
        const centroX = this.app.screen.width / 2;
        const centroY = this.app.screen.height / 2;

        // 1. Fondo del nivel
        this.background = new GameObject('fondo', centroX, centroY);
        this.background.sprite.width = this.app.screen.width;
        this.background.sprite.height = this.app.screen.height;
        this.app.stage.addChild(this.background.sprite);

        // 3. Barra en el medio
        this.barra = new GameObject('barra', centroX, centroY);
        this.app.stage.addChild(this.barra.sprite);

        // 2. Prota y su configuración de límites según el tamaño real de la barra
        this.prota = new Persona('prota', centroX, centroY, 4);
        
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

        // 5. Timer HUD (Fondo + Reloj militar de 06:00 a 18:00)
        this.hudTimer = new PIXI.Container();
        this.hudTimer.x = centroX;
        this.hudTimer.y = 40;

        const fondoTimerSprite = new PIXI.Sprite(PIXI.Assets.get('fondoTimer'));
        fondoTimerSprite.anchor.set(0.5);
        this.hudTimer.addChild(fondoTimerSprite);

        this.textoReloj = new PIXI.Text({
            text: '06:00 AM',
            style: { fontFamily: 'sans-serif', fontSize: 22, fill: 0xffffff, fontWeight: 'bold' }
        });
        this.textoReloj.anchor.set(0.5);
        this.hudTimer.addChild(this.textoReloj);
        this.app.stage.addChild(this.hudTimer);

        // 6. Botón Mate interactivo abajo a la derecha
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
        console.log("🧉 ¡Instancia Cebar activada!");
    }

    manejarRelojMilitar(ticker) {
        this.tiempoActualSegundos += ticker.elapsedMS / 1000;

        if (this.tiempoActualSegundos >= this.duracionPartidaSegundos) {
            this.tiempoActualSegundos = this.duracionPartidaSegundos;
            this.textoReloj.text = "18:00 PM";
            return;
        }

        const porcentajeProgreso = this.tiempoActualSegundos / this.duracionPartidaSegundos;
        const totalHorasSimuladas = 12; 
        const horaActualCalculada = 6 + (porcentajeProgreso * totalHorasSimuladas);

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