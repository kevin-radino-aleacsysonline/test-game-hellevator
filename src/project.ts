import * as Pixi from 'Pixi.js';
import _ from 'lodash';
import { Button } from './models/button';
import { assetTexturePaths, cols, phoneFormatDimensions, rows } from './constants';
import { TextureFormatTypes } from './types/textureFormatTypes';
import { PhoneFormatTypes } from './types/phoneFormatTypes';

export interface IProject {
    launch(): void;
}

export class Project implements IProject {
    public canvasApp: Pixi.Application<HTMLCanvasElement>;
    public mainContainer: Pixi.Container;
    public phoneContainer: Pixi.Container;
    public phoneMask?: Pixi.Graphics = undefined;

    public pixiTextures: Pixi.Texture<Pixi.Resource>[];
    public pixiSprites: Pixi.Sprite[];

    public currentPhoneFormat: PhoneFormatTypes = PhoneFormatTypes.IPhoneSE;
    public currentPhoneFormatIndex: number = 0;

    public currentTextureFormat: TextureFormatTypes = TextureFormatTypes.Default32;
    public currentTextureFormatIndex: number = 0;

    public topLeft: { x: number; y: number } = { x: 0, y: 0 };
    public center: { x: number; y: number } = { x: 0, y: 0 };

    public scale: number = 4;

    public phoneFormatLabel: Button;
    public textureFormatLabel: Button;

    public async launch(): Promise<void> {
        this.center = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        this.pixiSprites = [];
        this.pixiTextures = [];
        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window });
        this.mainContainer = new Pixi.Container();
        this.phoneContainer = new Pixi.Container();
        this.mainContainer.addChild(this.phoneContainer);
        this.canvasApp.stage.addChild(this.mainContainer);
        document.body.appendChild(this.canvasApp.view);
        this.createButtons();
        this.onPhoneFormatChange(0);
    }

    private createButtons(): void {
        const width = 192;
        const height = 40;
        const margin = 10;

        // Phone Format
        this.phoneFormatLabel = new Button('Current Phone Format', this.center.x - width * 0.5, 0, width, height, undefined);
        const phoneFormatNextButton = new Button('>', this.phoneFormatLabel.bounds.right + margin, 0, height, height, async () => {
            this.onPhoneFormatChange(this.currentPhoneFormatIndex + 1);
            await this.createPlayfield(TextureFormatTypes.Default32);
        });
        const phoneFormatPreviousButton = new Button('<', this.phoneFormatLabel.bounds.left - margin - height, 0, height, height, async () => {
            this.onPhoneFormatChange(this.currentPhoneFormatIndex - 1);
            await this.createPlayfield(TextureFormatTypes.Default32);
        });
        this.mainContainer.addChild(this.phoneFormatLabel.container);
        this.mainContainer.addChild(phoneFormatNextButton.container);
        this.mainContainer.addChild(phoneFormatPreviousButton.container);

        // Create Tiles
        this.textureFormatLabel = new Button('Create tiles 32x32', this.center.x - width * 0.5, height + margin, width, height, undefined);
        const textureFormatNextButton = new Button('>', this.phoneFormatLabel.bounds.right + margin, height + margin, height, height, async () => {
            this.onTextureFormatChange(this.currentTextureFormatIndex + 1);
            await this.createPlayfield(this.currentTextureFormat);
        });
        const textureFormatPreviousButton = new Button(
            '<',
            this.phoneFormatLabel.bounds.left - margin - height,
            height + margin,
            height,
            height,
            async () => {
                this.onTextureFormatChange(this.currentTextureFormatIndex - 1);
                await this.createPlayfield(this.currentTextureFormat);
            }
        );
        this.mainContainer.addChild(this.textureFormatLabel.container);
        this.mainContainer.addChild(textureFormatNextButton.container);
        this.mainContainer.addChild(textureFormatPreviousButton.container);
    }

    public async createPlayfield(format: TextureFormatTypes): Promise<void> {
        this.diposeTextures();

        const beginTop = this.topLeft.y;
        const beginLeft = this.topLeft.x;

        if (Pixi.utils.BaseTextureCache[assetTexturePaths[format][2]]) {
            Pixi.utils.BaseTextureCache[assetTexturePaths[format][2]].destroy();
            delete Pixi.utils.TextureCache[assetTexturePaths[format][2]];
        }
        const texture = await Pixi.Texture.fromURL(assetTexturePaths[format][2]);
        this.pixiTextures.push(texture);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const sprite = new Pixi.Sprite(texture);
                this.pixiSprites.push(sprite);

                sprite.position.set(beginLeft + j * texture.height * this.scale, beginTop + i * texture.width * this.scale);
                sprite.scale.set(this.scale, this.scale);
            }
        }
        this.pixiSprites.forEach((sprite: Pixi.Sprite) => {
            this.phoneContainer.addChild(sprite);
        });
    }

    public onTextureFormatChange(index: number): void {
        const values = Object.values(TextureFormatTypes);
        this.currentTextureFormatIndex = index;
        if (this.currentTextureFormatIndex < 0) {
            this.currentTextureFormatIndex = values.length - 1;
        }
        if (this.currentTextureFormatIndex >= values.length) {
            this.currentTextureFormatIndex = 0;
        }
        this.currentTextureFormat = values[this.currentTextureFormatIndex] as TextureFormatTypes;
        this.textureFormatLabel.changeText(this.currentTextureFormat);
    }

    public onPhoneFormatChange(index: number): void {
        const values = Object.values(PhoneFormatTypes);
        this.currentPhoneFormatIndex = index;
        if (this.currentPhoneFormatIndex < 0) {
            this.currentPhoneFormatIndex = values.length - 1;
        } else if (this.currentPhoneFormatIndex >= values.length) {
            this.currentPhoneFormatIndex = 0;
        }

        this.currentPhoneFormat = values[this.currentPhoneFormatIndex] as PhoneFormatTypes;
        this.phoneFormatLabel.changeText(this.currentPhoneFormat);
        const dimensions = phoneFormatDimensions[this.currentPhoneFormat];
        this.topLeft = {
            x: Math.abs(this.center.x - dimensions.w * 0.5),
            y: Math.abs(this.center.y - dimensions.h * 0.5),
        };

        if (this.phoneMask) {
            this.phoneContainer.removeChild(this.phoneMask);
            this.phoneMask?.destroy();
            this.phoneMask = undefined;
        }

        const newMask = new Pixi.Graphics();
        newMask.beginFill(0xff0000, 0.5);
        newMask.drawRect(this.topLeft.x, this.topLeft.y, dimensions.w, dimensions.h);
        newMask.endFill();
        this.phoneContainer.mask = newMask;
        this.phoneContainer.addChild(newMask);

        this.phoneMask = newMask;
    }

    public diposeTextures(): void {
        for (let i = 0; i < this.pixiTextures.length; i++) {
            Pixi.Texture.removeFromCache(this.pixiTextures[i]);
            this.pixiTextures[i].destroy();
            this.pixiSprites[i].removeFromParent();
            this.pixiSprites[i].destroy(true);
        }
        this.pixiTextures.splice(0);
        this.pixiSprites.splice(0);
    }
}
