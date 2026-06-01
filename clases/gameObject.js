export class GameObject {
    constructor(x = 0, y = 0) {
        this.sprite = null;
        this.x = x;
        this.y = y;
    }

    configurarSprite(spriteInstance) {
        this.sprite = spriteInstance;
        this.sprite.anchor.set(0.5); 
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    update(ticker) {

    }
}