import * as Pixi from 'Pixi.js';
import { ButtonBounds } from '../types/buttonBounds';

export class UIElement {
    public container: Pixi.Container;
    public text: Pixi.Text;
    public bounds: ButtonBounds;

    constructor(
        text: string,
        x: number,
        y: number,
        w: number,
        h: number,
        callback?: () => void,
        color: number = 0x000000,
        textOpts?: Partial<Pixi.ITextStyle> | Pixi.TextStyle
    ) {
        const g1 = new Pixi.Graphics();
        g1.beginFill(color);
        g1.drawRect(0, 0, w, h);
        g1.endFill();

        this.text = new Pixi.Text(text, { ...{ fontFamily: 'Arial', fontSize: 16, fill: 0xffffff, align: 'center' }, ...textOpts });

        this.text.anchor.set(0.5, 0.5);
        this.text.position.set(w * 0.5, h * 0.5);

        this.container = new Pixi.Container();
        this.container.hitArea = new Pixi.Rectangle(0, 0, w, h);
        this.container.interactive = true;
        this.container.position.set(x, y);
        if (callback !== undefined) {
            this.container.on('touch', async () => {
                callback?.();
            });
            this.container.on('click', async () => {
                callback?.();
            });
        }

        this.container.addChild(g1);
        this.container.addChild(this.text);

        this.bounds = {
            left: x,
            right: x + w,
            top: y,
            bottom: y + h,
            width: w,
            height: h,
            center: (x + x + w) * 0.5,
        };
    }

    public changeText(text: string): void {
        this.text.text = text;
    }

    public changeTextColor(color: number): void {
        this.text.tint = color;
    }

    public setText(text: Pixi.Text): void {
        this.text?.destroy();
        this.text = text;
        this.text.anchor.set(0.5, 0.5);
        this.text.position.set(this.bounds.width * 0.5, this.bounds.height * 0.5);
    }

    public dispose(): void {
        this.container.parent?.removeChild(this.container);
        this.container.removeChildren();
        this.container.destroy();
        this.text.destroy();
    }
}
