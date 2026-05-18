import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject.js';
import { Persona } from './Persona.js';

export class Juego {
    constructor() {
        this.app = new PIXI.Application();
        this.entidades = [];
        this.duracionPartidaSegundos = 180; // 3 minutos reales
        this.tiempoActualSegundos = 0;
    }

    async arrancar() {
        // Inicializamos el canvas de Pixi v8
        await this.app.init({ width: 800, height: 600, backgroundColor: 0x101010 });
        document.body.appendChild(this.app.canvas);

        // Primero cargamos todo de forma asíncrona
        await this.cargarAssets();

        // Una vez cargadas las texturas, armamos la escena de juego
        this.crearEscena();

        // Activamos el ticker principal de Pixi
        this.app.ticker.add((ticker) => this.loop(ticker));
    }

    async cargarAssets() {
        // Declaramos los alias de tus archivos PNG
        PIXI.Assets.add({ alias: 'fondo', src: 'background.png' });
        PIXI.Assets.add({ alias: 'prota', src: 'prota.png' });
        PIXI.Assets.add({ alias: 'barra', src: 'barra.png' });
        PIXI.Assets.add({ alias: 'fondoTimer', src: 'fondo-timer.png' });
        PIXI.Assets.add({ alias: 'mate', src: 'mate.png' });

        // Esperamos que impacte la carga completa en memoria
        await PIXI.Assets.load(['fondo', 'prota', 'barra', 'fondoTimer', 'mate']);
    }

    crearEscena() {
        const centroX = this.app.screen.width / 2;
        const centroY = this.app.screen.height / 2;

        // 1. BACKGROUND: Fondo del nivel
        this.background = new GameObject('fondo', centroX, centroY);
        this.background.sprite.width = this.app.screen.width;
        this.background.sprite.height = this.app.screen.height;
        this.app.stage.addChild(this.background.sprite);

        // 3. BARRA: Puesta exactamente en el medio
        this.barra = new GameObject('barra', centroX, centroY);
        this.app.stage.addChild(this.barra.sprite);

        // 2. PROTA: Personaje principal sobre la barra con límites dinámicos
        this.prota = new Persona('prota', centroX, centroY, 4);
        
        // Calculamos los extremos de la barra para trabar al personaje ahí dentro
        const rangoX = this.barra.sprite.width / 2;
        const rangoY = this.barra.sprite.height / 2;
        
        this.prota.definirLimitesMapeo(
            centroX - rangoX, // Borde izquierdo
            centroX + rangoX, // Borde derecho
            centroY - rangoY, // Borde superior
            centroY + rangoY  // Borde inferior
        );
        this.app.stage.addChild(this.prota.sprite);
        this.entidades.push(this.prota); // Lo sumamos a la lista de updates

        // 5. TIMER: Contenedor con su fondo-timer.png y texto de horas
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

        // 6. BOTÓN MATE: Ubicado abajo a la derecha con acción interactiva
        this.botonMate = new PIXI.Sprite(PIXI.Assets.get('mate'));
        this.botonMate.anchor.set(0.5);
        this.botonMate.x = this.app.screen.width - 80;
        this.botonMate.y = this.app.screen.height - 80;
        
        // Configuraciones de interacción v8
        this.botonMate.eventMode = 'static';
        this.botonMate.cursor = 'pointer';
        
        // Asignamos la función cebar
        this.botonMate.on('pointerdown', () => this.cebar());
        this.app.stage.addChild(this.botonMate);

        // 4. NPCs: Ignorados olímpicamente a pedido tuyo por ahora.
    }

    cebar() {
        console.log("🧉 ¡Instancia Cebar activada! Un elissir.");
        // Acá irá tu futura lógica (restaurar barra, calmar NPCs, etc.)
    }

    manejarRelojMilitar(ticker) {
        // Sumamos el tiempo real transcurrido frame a frame (en segundos)
        this.tiempoActualSegundos += ticker.elapsedMS / 1000;

        if (this.tiempoActualSegundos >= this.duracionPartidaSegundos) {
            this.tiempoActualSegundos = this.duracionPartidaSegundos;
            this.textoReloj.text = "18:00 PM";
            return;
        }

        // Mapeo matemático: De 0 a 100% de la partida, avanzar de 6:00 a 18:00 (12 horas de brecha)
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
        // Corre el reloj
        this.manejarRelojMilitar(ticker);

        // Actualiza al prota (y futuros NPCs si los metés en el array)
        for (const entidad of this.entidades) {
            entidad.update(ticker);
        }
    }
}