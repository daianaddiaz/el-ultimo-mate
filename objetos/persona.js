import { GameObject } from './gameObject.js';

export class Persona extends GameObject {
    constructor(spritesheetKey, x, y, velocidadMaxima = 3) {
        super(x, y);
        this.teclas = { w: false, a: false, s: false, d: false };
        this.limites = { minX: 0, maxX: 800, minY: 0, maxY: 600 };


        this.velocidadMaxima = velocidadMaxima;
        this.velocidad = { x: 0, y: 0 };
        this.friccion = 0.85;        
        this.cuantaAceleracion = 0.4;


        const sheet = PIXI.Assets.get(spritesheetKey);
        if (!sheet) {
            console.error(`🚨 No se pudo obtener el spritesheet: ${spritesheetKey}`);
            return;
        }

        this.animaciones = {};

        if (sheet.animations && sheet.textures) {
            for (const [nombreAnim, listaFrames] of Object.entries(sheet.animations)) {
                const texturasCorregidas = [];

                for (const frameInput of listaFrames) {
                    if (!frameInput) continue;

                    const nombreTexto = typeof frameInput === 'string' ? frameInput : (frameInput.name || String(frameInput));
                    const claveReal = nombreTexto.startsWith('prota/') ? nombreTexto : `prota/${nombreTexto}`;

                    if (sheet.textures[claveReal]) {
                        texturasCorregidas.push(sheet.textures[claveReal]);
                    }
                }

                if (texturasCorregidas.length > 0) {
                    this.animaciones[nombreAnim] = texturasCorregidas;
                }
            }
        }

        let texturasIniciales = this.animaciones['abajo'] || this.animaciones['idle'];
        
        if (!texturasIniciales && Object.keys(this.animaciones).length > 0) {
            const primerNombreAnim = Object.keys(this.animaciones);
            texturasIniciales = this.animaciones[primerNombreAnim];
        }

        if (!texturasIniciales && sheet.textures) {
            texturasIniciales = Object.values(sheet.textures);
        }

        if (!texturasIniciales || texturasIniciales.length === 0) {
            texturasIniciales = [PIXI.Texture.WHITE]; 
        }


        const animatedSprite = new PIXI.AnimatedSprite(texturasIniciales);
        animatedSprite.animationSpeed = 0.15;
        animatedSprite.anchor.set(0.5, 0.5); 
        
        this.configurarSprite(animatedSprite);
        this.escucharTeclado();


        this.sprite.visible = true;
        this.sprite.alpha = 1;
        this.sprite.scale.set(1); 
        this.sprite.gotoAndPlay(0); 
        
        this.animacionActual = this.animaciones['abajo'] ? 'abajo' : (Object.keys(this.animaciones) || 'idle');
    }

    escucharTeclado() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.teclas) this.teclas[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.teclas) this.teclas[key] = false;
        });
    }

    cambiarAnimacion(nuevaAnim) {
        let animAEjecutar = nuevaAnim;

        if (!this.animaciones[animAEjecutar]) {
            animAEjecutar = 'abajo';
        }

        if (this.animacionActual === animAEjecutar || !this.animaciones[animAEjecutar]) return;
        
        this.animacionActual = animAEjecutar;
        this.sprite.textures = this.animaciones[animAEjecutar];
        this.sprite.play();
    }

    definirLimitesMapeo(minX, maxX, minY, maxY) {
        this.limites = { minX, maxX, minY, maxY };
    }

    update(ticker) {
        const dt = ticker.deltaTime;
        let proximaAnimacion = null;
        let moviendose = false;

        if (!this.sprite) return;

// APLICAR ACELERACIÓN SEGÚN INPUTS WASD ---
        if (this.teclas.a) { // Izquierda
            this.velocidad.x -= this.cuantaAceleracion * dt;
            proximaAnimacion = 'izquierda';
            moviendose = true;
        } else if (this.teclas.d) { // Derecha
            this.velocidad.x += this.cuantaAceleracion * dt;
            proximaAnimacion = 'derecha';
            moviendose = true;
        }

        if (this.teclas.w) { // Arriba
            this.velocidad.y -= this.cuantaAceleracion * dt;
            if (!moviendose) proximaAnimacion = 'arriba';
            moviendose = true;
        } else if (this.teclas.s) { // Abajo
            this.velocidad.y += this.cuantaAceleracion * dt;
            if (!moviendose) proximaAnimacion = 'abajo';
            moviendose = true;
        }

// APLICAR INERCIA Y FRICCIÓN 
        if (!moviendose) {
            this.velocidad.x *= Math.pow(this.friccion, dt);
            this.velocidad.y *= Math.pow(this.friccion, dt);
            
            // Apagamos valores ultra chicos para evitar micro-movimientos fantasmas
            if (Math.abs(this.velocidad.x) < 0.05) this.velocidad.x = 0;
            if (Math.abs(this.velocidad.y) < 0.05) this.velocidad.y = 0;
        }

// LIMITAR A LA VELOCIDAD MÁXIMA ---
        const velocidadLineal = Math.sqrt(this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y);
        if (velocidadLineal > this.velocidadMaxima) {
            const factor = this.velocidadMaxima / velocidadLineal;
            this.velocidad.x *= factor;
            this.velocidad.y *= factor;
        }

//ASIGNAR POSICIÓN REAL AL SPRITE ---
        this.sprite.x += this.velocidad.x * dt;
        this.sprite.y += this.velocidad.y * dt;

// CONTROL DE CICLOS DE ANIMACIÓN
        if (velocidadLineal > 0.1) {
            if (!proximaAnimacion) {
                if (Math.abs(this.velocidad.x) > Math.abs(this.velocidad.y)) {
                    proximaAnimacion = this.velocidad.x > 0 ? 'derecha' : 'izquierda';
                } else {
                    proximaAnimacion = this.velocidad.y > 0 ? 'abajo' : 'arriba';
                }
            }
            
            this.cambiarAnimacion(proximaAnimacion);
            if (!this.sprite.playing) this.sprite.play();
        } else {
            this.sprite.stop();
        }

// LÍMITES CONTRA LA BARRA (Frena posición y clava vector en 0) ---
        if (this.sprite.x < this.limites.minX) { this.sprite.x = this.limites.minX; this.velocidad.x = 0; }
        if (this.sprite.x > this.limites.maxX) { this.sprite.x = this.limites.maxX; this.velocidad.x = 0; }
        if (this.sprite.y < this.limites.minY) { this.sprite.y = this.limites.minY; this.velocidad.y = 0; }
        if (this.sprite.y > this.limites.maxY) { this.sprite.y = this.limites.maxY; this.velocidad.y = 0; }
    }
}