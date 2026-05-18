
export class GameObject {
    constructor(textureKey, x = 0, y = 0) {
        // En Pixi v8 obtenemos la textura ya cargada desde el cache global
        const texture = PIXI.Assets.get(textureKey);
        
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5); // Centramos el eje para el prota y la barra
        this.sprite.x = x;
        this.sprite.y = y;
    }

    update(ticker) {
        // Se sobrescribe en las clases hijas
    }
}