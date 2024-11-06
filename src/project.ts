import * as Pixi from 'Pixi.js';
import _ from 'lodash';
import { Button } from './models/button';
import { assetTexturePaths, COLS, phoneFormatDimensions, ROWS, tileMapGuide, TILESIZE } from './constants';
import { TextureFormatTypes } from './types/textureFormatTypes';
import { PhoneFormatTypes } from './types/phoneFormatTypes';
import { ViewTypes } from './types/viewTypes';

export interface IProject {
    launch(): void;
}

export class Project implements IProject {
    public canvasApp: Pixi.Application<HTMLCanvasElement>;
    private mainContainer: Pixi.Container;
    private phoneContainer: Pixi.Container;
    private scaleSettingContainer: Pixi.Container;
    private tildIdSettingContainer: Pixi.Container;
    private phoneMask?: Pixi.Graphics = undefined;

    private textures: Pixi.Texture<Pixi.Resource>[] = [];
    private tiles: Pixi.Sprite[] = [];
    private characters: Pixi.Sprite[] = [];
    private elevator?: Pixi.Sprite;

    private currentPhoneFormat: PhoneFormatTypes = PhoneFormatTypes.IPhoneSE;
    private currentPhoneFormatIndex: number = 0;

    private currentTextureFormat: TextureFormatTypes = TextureFormatTypes.None;
    private currentTextureFormatIndex: number = 0;

    private currentViewType: ViewTypes;

    private topLeft: { x: number; y: number } = { x: 0, y: 0 };
    private center: { x: number; y: number } = { x: 0, y: 0 };

    private currentScale: number = -1;
    private currentTileId: number = -1;

    private phoneFormatLabel: Button;
    private textureFormatLabel: Button;
    private scaleLabel: Button;
    private tileIdLabel: Button;
    private viewTypeButton: Button;

    private phoneBackground?: Pixi.Graphics;

    private isholdingShift: boolean = false;
    private isholdingControl: boolean = false;

    private mapSavedSettings: Record<PhoneFormatTypes, Record<TextureFormatTypes, { s: number; id: number }>> = {
        [PhoneFormatTypes.IPhoneSE]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
        [PhoneFormatTypes.IPhoneXR]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
        [PhoneFormatTypes.IPhone12Pro]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
        [PhoneFormatTypes.IPhone14ProMax]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
        [PhoneFormatTypes.Pixel7]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
        [PhoneFormatTypes.SamsungGalaxyS8Plus]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
        [PhoneFormatTypes.SamsungGalaxyS20Ultra]: {
            [TextureFormatTypes.None]: { s: 1, id: 0 },
            [TextureFormatTypes.Default32]: { s: 1, id: 0 },
            [TextureFormatTypes.Scaled32To128]: { s: 1, id: 0 },
        },
    };

    public async launch(): Promise<void> {
        this.center = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window });
        this.mainContainer = new Pixi.Container();
        this.phoneContainer = new Pixi.Container();
        this.scaleSettingContainer = new Pixi.Container();
        this.tildIdSettingContainer = new Pixi.Container();
        this.mainContainer.addChild(this.scaleSettingContainer);
        this.mainContainer.addChild(this.tildIdSettingContainer);
        this.mainContainer.addChild(this.phoneContainer);
        this.canvasApp.stage.addChild(this.mainContainer);
        document.body.appendChild(this.canvasApp.view);
        this.createButtons();
        this.onPhoneFormatChange(0);
        this.onTextureFormatChange(0);
        this.onScaleChange(1);
        this.onTileChange(0);
        this.onViewTypeChange(ViewTypes.Playfield);
        this.bindEvents();
    }

    private createButtons(): void {
        const width = 192;
        const height = 40;
        const margin = 5;
        const beginY = height * 2;

        // Phone Format
        this.phoneFormatLabel = new Button('Current Phone Format', height + margin, beginY, width, height, undefined);
        const phoneFormatNextButton = new Button(
            '>',
            this.phoneFormatLabel.bounds.right + margin,
            this.phoneFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onPhoneFormatChange(this.currentPhoneFormatIndex + 1);
                await this.createAssets(this.currentTextureFormat);
            }
        );
        const phoneFormatPreviousButton = new Button(
            '<',
            this.phoneFormatLabel.bounds.left - margin - height,
            this.phoneFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onPhoneFormatChange(this.currentPhoneFormatIndex - 1);
                await this.createAssets(this.currentTextureFormat);
            }
        );
        this.mainContainer.addChild(this.phoneFormatLabel.container);
        this.mainContainer.addChild(phoneFormatNextButton.container);
        this.mainContainer.addChild(phoneFormatPreviousButton.container);

        // Texture format Format
        this.textureFormatLabel = new Button(
            'Create tiles',
            this.phoneFormatLabel.bounds.left,
            this.phoneFormatLabel.bounds.top + margin + height,
            width,
            height,
            undefined
        );
        const textureFormatNextButton = new Button(
            '>',
            this.textureFormatLabel.bounds.right + margin,
            this.textureFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onTextureFormatChange(this.currentTextureFormatIndex + 1);
                await this.createAssets(this.currentTextureFormat);
            }
        );
        const textureFormatPreviousButton = new Button(
            '<',
            this.textureFormatLabel.bounds.left - margin - height,
            this.textureFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onTextureFormatChange(this.currentTextureFormatIndex - 1);
                await this.createAssets(this.currentTextureFormat);
            }
        );
        this.mainContainer.addChild(this.textureFormatLabel.container);
        this.mainContainer.addChild(textureFormatNextButton.container);
        this.mainContainer.addChild(textureFormatPreviousButton.container);

        // View Type
        this.viewTypeButton = new Button(
            'View Type',
            this.textureFormatLabel.bounds.left,
            this.textureFormatLabel.bounds.top + margin + height,
            width,
            height,
            async () => {
                this.onViewTypeChange(this.currentViewType === ViewTypes.Playfield ? ViewTypes.Tiles : ViewTypes.Playfield);
                await this.createAssets(this.currentTextureFormat);
            }
        );
        this.mainContainer.addChild(this.viewTypeButton.container);

        // Scaling Tiles
        this.scaleLabel = new Button(
            'Scale: ',
            this.viewTypeButton.bounds.left,
            this.viewTypeButton.bounds.top + margin + height,
            width,
            height,
            undefined
        );
        const scaleNextButton = new Button('>', this.scaleLabel.bounds.right + margin, this.scaleLabel.bounds.top, height, height, async () => {
            this.onScaleChange(this.currentScale + this.getScaleIncrements());
            await this.createAssets(this.currentTextureFormat);
        });
        const scalePreviousButton = new Button(
            '<',
            this.scaleLabel.bounds.left - margin - height,
            this.scaleLabel.bounds.top,
            height,
            height,
            async () => {
                this.onScaleChange(this.currentScale - this.getScaleIncrements());
                await this.createAssets(this.currentTextureFormat);
            }
        );
        this.scaleSettingContainer.addChild(this.scaleLabel.container);
        this.scaleSettingContainer.addChild(scaleNextButton.container);
        this.scaleSettingContainer.addChild(scalePreviousButton.container);

        // Tile Id
        this.tileIdLabel = new Button(
            'Tile Id: ',
            this.scaleLabel.bounds.left,
            this.scaleLabel.bounds.top + height + margin,
            width,
            height,
            undefined
        );
        const tileIdNextButton = new Button('>', this.tileIdLabel.bounds.right + margin, this.tileIdLabel.bounds.top, height, height, async () => {
            this.onTileChange(this.currentTileId + 1);
            await this.createAssets(this.currentTextureFormat);
        });
        const tileIdPreviousButton = new Button(
            '<',
            this.tileIdLabel.bounds.left - margin - height,
            this.tileIdLabel.bounds.top,
            height,
            height,
            async () => {
                this.onTileChange(this.currentTileId - 1);
                await this.createAssets(this.currentTextureFormat);
            }
        );
        this.tildIdSettingContainer.addChild(this.tileIdLabel.container);
        this.tildIdSettingContainer.addChild(tileIdNextButton.container);
        this.tildIdSettingContainer.addChild(tileIdPreviousButton.container);
    }

    private getScaleIncrements(): number {
        if (this.isholdingControl && !this.isholdingShift) {
            return 0.25;
        }
        if (this.isholdingShift && !this.isholdingControl) {
            return 0.5;
        }
        if (this.isholdingShift && this.isholdingControl) {
            return 0.1;
        }
        return 1;
    }

    private async createAssets(format: TextureFormatTypes): Promise<void> {
        this.diposeTextures();

        if (this.currentViewType === ViewTypes.Playfield) {
            await this.createTiles(format);
            await this.createElevator();
            await this.createCharacters();
            this.updateTransforms();
        } else {
            await this.createTileField(format);
        }
    }

    private async createTileField(format: TextureFormatTypes): Promise<void> {
        if (format === TextureFormatTypes.None) {
            return;
        }
        const texture = await Pixi.Texture.fromURL(assetTexturePaths[format][this.currentTileId]);
        texture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
        this.textures.push(texture);
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const sprite = new Pixi.Sprite(texture);
                this.tiles.push(sprite);
                sprite.position.set(this.topLeft.x + j * texture.height * this.currentScale, this.topLeft.y + i * texture.width * this.currentScale);
                sprite.scale.set(this.currentScale, this.currentScale);
                this.phoneContainer.addChild(sprite);
            }
        }
    }

    private async createTiles(format: TextureFormatTypes): Promise<void> {
        for (let t = 0; t < assetTexturePaths[format].length; t++) {
            const texture = await Pixi.Texture.fromURL(assetTexturePaths[format][t]);
            texture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
            this.textures.push(texture);
        }
        const emptyTexture = await Pixi.Texture.fromURL('./assets/texture/empty.png');
        this.textures.push(emptyTexture);

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const texture = this.textures[tileMapGuide[r][c]];
                if (texture === undefined) {
                    const sprite = new Pixi.Sprite(emptyTexture);
                    this.tiles.push(sprite);
                    this.phoneContainer.addChild(sprite);
                } else {
                    const sprite = new Pixi.Sprite(texture);
                    this.tiles.push(sprite);
                    this.phoneContainer.addChild(sprite);
                }
            }
        }
    }

    private async createCharacters(): Promise<void> {
        const texture = await Pixi.Texture.fromURL('./assets/texture/character.png');
        const charScaled = 0.6;
        texture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
        this.textures.push(texture);
        for (let i = 0; i < 5; i++) {
            const charSprite = new Pixi.Sprite(texture);
            charSprite.scale.set(
                charScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
                charScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
            );
            this.characters.push(charSprite);
            this.phoneContainer.addChild(charSprite);
        }
    }

    private async createElevator(): Promise<void> {
        const texture = await Pixi.Texture.fromURL('./assets/texture/elevator.png');
        const elevatorScaled = 0.9;
        texture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
        this.textures.push(texture);
        this.elevator = new Pixi.Sprite(texture);
        this.elevator.scale.set(
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
        );
        this.phoneContainer.addChild(this.elevator);
    }

    private updateTransforms(): void {
        // Tiles
        for (let i = 0; i < this.tiles.length; i++) {
            const row = Math.floor(i / COLS);
            const column = i % COLS;
            this.tiles[i].position.set(
                this.topLeft.x + column * this.tiles[i]!.height * this.currentScale,
                this.topLeft.y + row * this.tiles[i]!.width * this.currentScale
            );
            this.tiles[i].scale.set(this.currentScale, this.currentScale);
        }

        // Characters
        const charBeginPos = { x: 5, y: 4 };
        for (let j = 0; j < this.characters.length; j++) {
            this.characters[j].position.set(
                this.topLeft.x +
                    charBeginPos.x * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s +
                    j * this.characters[j].width,
                this.topLeft.y +
                    charBeginPos.y * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                    this.characters[j].height
            );
        }

        // Elevator
        const elevatorBeginPos = { x: 1, y: 4 };
        this.elevator!.position.set(
            this.topLeft.x + elevatorBeginPos.x * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            this.topLeft.y +
                elevatorBeginPos.y * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                this.elevator!.height
        );
    }

    private onPhoneFormatChange(index: number): void {
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

        if (this.phoneBackground) {
            this.phoneContainer.removeChild(this.phoneBackground);
            this.phoneBackground?.destroy();
        }
        this.phoneBackground = new Pixi.Graphics();
        this.phoneBackground.beginFill(0x1c0b14);
        this.phoneBackground.drawRect(this.topLeft.x, this.topLeft.y, dimensions.w, dimensions.h);
        this.phoneBackground.endFill();
        this.phoneContainer.addChildAt(this.phoneBackground, 0);

        this.onScaleChange(this.mapSavedSettings[this.currentPhoneFormat][this.currentTextureFormat].s);
        this.onTileChange(this.mapSavedSettings[this.currentPhoneFormat][this.currentTextureFormat].id);
    }

    private onTextureFormatChange(index: number): void {
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

        this.scaleSettingContainer.visible = this.currentTextureFormat !== TextureFormatTypes.None;
        this.viewTypeButton.container.visible = this.currentTextureFormat !== TextureFormatTypes.None;

        this.onScaleChange(this.mapSavedSettings[this.currentPhoneFormat][this.currentTextureFormat].s);
        this.onTileChange(this.mapSavedSettings[this.currentPhoneFormat][this.currentTextureFormat].id);
    }

    private onScaleChange(scale: number): void {
        if (this.currentScale === scale) {
            return;
        }
        this.currentScale = scale;
        if (this.currentScale < 0.1) {
            this.currentScale = 0.1;
        }
        if (this.currentScale > 10) {
            this.currentScale = 10;
        }

        this.scaleLabel.changeText(`Scale: ${this.currentScale.toFixed(2)}`);
        this.mapSavedSettings[this.currentPhoneFormat][this.currentTextureFormat].s = this.currentScale;
    }

    private onTileChange(id: number): void {
        if (this.currentTileId === id) {
            return;
        }
        this.currentTileId = id;
        if (this.currentTileId < 0) {
            this.currentTileId = assetTexturePaths[this.currentTextureFormat].length - 1;
        }
        if (this.currentTileId >= assetTexturePaths[this.currentTextureFormat].length) {
            this.currentTileId = 0;
        }

        this.tileIdLabel.changeText(`Tile Id: ${this.currentTileId}`);
        Object.values(TextureFormatTypes).forEach((type: TextureFormatTypes) => {
            this.mapSavedSettings[this.currentPhoneFormat][type].id = this.currentTileId;
        });
    }

    private onViewTypeChange(type: ViewTypes): void {
        if (this.currentViewType === type) {
            return;
        }
        this.currentViewType = type;
        this.viewTypeButton.changeText(this.currentViewType);
        this.tildIdSettingContainer.visible = this.currentTextureFormat !== TextureFormatTypes.None && this.currentViewType === ViewTypes.Tiles;
    }

    public diposeTextures(): void {
        this.textures.forEach((texture: Pixi.Texture<Pixi.Resource>) => {
            texture.destroy();
        });
        this.textures.splice(0);
        this.tiles.forEach((tile: Pixi.Sprite) => {
            tile.parent?.removeChild(tile);
            tile.destroy();
        });
        this.tiles.splice(0);
        this.characters.forEach((character: Pixi.Sprite) => {
            character.parent?.removeChild(character);
            character.destroy();
        });
        this.characters.splice(0);
        this.elevator?.parent?.removeChild(this.elevator);
        this.elevator?.destroy();
        this.elevator = undefined;
        this.clearTextureCache();
    }

    public clearTextureCache(): void {
        Object.values(TextureFormatTypes).forEach((type: string) => {
            const textureIds = assetTexturePaths[type as TextureFormatTypes];
            for (let i = 0; i < textureIds.length; i++) {
                if (Pixi.utils.BaseTextureCache[textureIds[i]]) {
                    Pixi.utils.BaseTextureCache[textureIds[i]].destroy();
                    delete Pixi.utils.TextureCache[textureIds[i]];
                }
            }
        });
    }

    private bindEvents(): void {
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey) {
                this.isholdingShift = true;
            }
            if (event.ctrlKey) {
                this.isholdingControl = true;
            }
        });
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.isholdingShift = false;
            }
            if (event.key === 'Control') {
                this.isholdingControl = false;
            }
        });
    }
}
