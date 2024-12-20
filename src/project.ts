import * as Pixi from 'Pixi.js';
import _ from 'lodash';
import { UIElement } from './models/uiElement';
import {
    assetTexturePaths,
    beginTileMapGuide,
    COLS,
    dropStopTileMapGuide,
    dropTileMapGuide,
    getPointOnCurve,
    multipliers,
    phoneFormatDimensions,
    ROWS,
    TILESIZE,
} from './constants';
import { TextureFormatTypes } from './types/textureFormatTypes';
import { PhoneFormatTypes } from './types/phoneFormatTypes';
import { IProject } from './types/projectType';
import * as TWEEN from '@tweenjs/tween.js';
import { TextureTypes } from './types/textureTypes';
import { GameState } from './types/gameStates';

export class Project implements IProject {
    public canvasApp: Pixi.Application<HTMLCanvasElement>;
    private mainContainer: Pixi.Container;
    private phoneContainer: Pixi.Container;
    private hudContainer: Pixi.Container;
    private scaleSettingContainer: Pixi.Container;

    private phoneMask?: Pixi.Graphics = undefined;
    private phoneBackground?: Pixi.Graphics = undefined;

    private textures: Map<TextureTypes, Pixi.Texture<Pixi.Resource>[]> = new Map<TextureTypes, Pixi.Texture<Pixi.Resource>[]>();
    private tiles: Record<number, Pixi.Sprite[]> = {
        [1]: [],
        [0]: [],
    };
    private tilesIndex: number = 0;
    private characters: Pixi.Sprite[] = [];

    private elevator?: Pixi.Sprite;
    private elevatorCage?: Pixi.Sprite;
    private elevatorStairs?: Pixi.Sprite;
    private elevatorBg?: Pixi.Sprite;

    private currentPhoneFormat: PhoneFormatTypes = PhoneFormatTypes.IPhoneSE;
    private currentPhoneFormatIndex: number = 0;

    private currentTextureFormat: TextureFormatTypes = TextureFormatTypes.Default32;
    private currentTextureFormatIndex: number = 0;

    private topLeft: { x: number; y: number } = { x: 0, y: 0 };
    private center: { x: number; y: number } = { x: 0, y: 0 };

    private currentScale: number = -1;

    private phoneFormatLabel: UIElement;
    private textureFormatLabel: UIElement;
    private scaleLabel: UIElement;

    private isholdingShift: boolean = false;
    private isholdingControl: boolean = false;

    private currentDifficulty: number = 1;

    private mapSavedSettings: Record<PhoneFormatTypes, Record<TextureFormatTypes, { s: number }>> = {
        [PhoneFormatTypes.IPhoneSE]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
        [PhoneFormatTypes.IPhoneXR]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
        [PhoneFormatTypes.IPhone12Pro]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
        [PhoneFormatTypes.IPhone14ProMax]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
        [PhoneFormatTypes.Pixel7]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
        [PhoneFormatTypes.SamsungGalaxyS8Plus]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
        [PhoneFormatTypes.SamsungGalaxyS20Ultra]: {
            [TextureFormatTypes.None]: { s: 1 },
            [TextureFormatTypes.Default32]: { s: 1 },
            [TextureFormatTypes.Scaled32To128]: { s: 1 },
        },
    };

    private hudSprites: Pixi.Sprite[] = [];
    private difficultyLabel?: UIElement = undefined;
    private autoLabel?: UIElement = undefined;
    private nextLabel?: UIElement = undefined;
    private currentBetText?: UIElement = undefined;
    private currentWalletText?: UIElement = undefined;
    private stakeMultiplierText?: UIElement = undefined;

    private difficultyMapText: Map<number, UIElement> = new Map<number, UIElement>();
    private difficultyMapHighlights: Map<number, Pixi.Sprite> = new Map<number, Pixi.Sprite>();
    private difficultyMapButtons: Map<number, UIElement> = new Map<number, UIElement>();

    private nextLowSprite?: Pixi.Sprite = undefined;
    private nextMidSprite?: Pixi.Sprite = undefined;
    private nextHighSprite?: Pixi.Sprite = undefined;
    private nextTimer?: UIElement = undefined;

    private betLabel?: UIElement = undefined;
    private getOutLabel?: UIElement = undefined;
    private getOutButtonSprite?: Pixi.Sprite = undefined;
    private getOutDisabledButtonSprite?: Pixi.Sprite = undefined;
    private betButton?: UIElement = undefined;
    private hasBet: boolean = false;
    private hasGottenOut: boolean = false;

    private lastTime: number = 0;
    private timeLeft: number = 5;
    private sectionsLeft: number = 0;
    private timePerSection: number = 1500;
    private timePerIdle: number = 10;
    private tilePageContainer: Pixi.Container[] = [];
    private gameState: GameState = GameState.Idle;
    private amountOfDrops: number = 0;
    private dropsDone: number = 0;
    private layer: number = 0;
    private stakeIndex: number = 0;

    public async launch(): Promise<void> {
        Pixi.Assets.addBundle('fonts', [{ alias: 'upheavtt', src: '../assets/fonts/upheavtt.ttf' }]);
        await Pixi.Assets.loadBundle('fonts');

        this.center = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window });
        this.mainContainer = new Pixi.Container();
        this.phoneContainer = new Pixi.Container();
        this.hudContainer = new Pixi.Container();
        this.scaleSettingContainer = new Pixi.Container();
        this.tilePageContainer.push(...[new Pixi.Container(), new Pixi.Container()]);
        this.tilePageContainer[1].position.set(0, ROWS * TILESIZE);

        this.lastTime = 0;
        this.timeLeft = this.timePerIdle;

        this.mainContainer.addChild(this.scaleSettingContainer);
        this.phoneContainer.addChild(this.tilePageContainer[0]);
        this.phoneContainer.addChild(this.tilePageContainer[1]);
        this.mainContainer.addChild(this.phoneContainer);
        this.mainContainer.addChild(this.hudContainer);
        this.canvasApp.stage.addChild(this.mainContainer);
        document.body.appendChild(this.canvasApp.view);

        await this.loadTextures(this.currentTextureFormat);
        this.createButtons();
        this.onPhoneFormatChange(0);
        await this.onTextureFormatChange(1);

        this.onScaleChange(1);

        await this.createHud();
        await this.createAssets();
        this.onDifficultyChange(this.currentDifficulty);

        this.bindEvents();
        this.update = this.update.bind(this);
        requestAnimationFrame(this.update);
    }

    private async loadTextures(format: TextureFormatTypes): Promise<void> {
        await this.loadTileTextures();

        if (!this.textures.has(TextureTypes.Character)) {
            const texture = await Pixi.Texture.fromURL('./assets/texture/character.png');
            texture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
            this.textures.set(TextureTypes.Character, [texture]);
        }

        if (!this.textures.has(TextureTypes.Elevator)) {
            const elevatorTexture = await Pixi.Texture.fromURL('./assets/texture/elevator/elevator.png');
            elevatorTexture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
            const elevatorCageTexture = await Pixi.Texture.fromURL('./assets/texture/elevator/cage.png');
            elevatorCageTexture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
            const elevatorStairsTexture = await Pixi.Texture.fromURL('./assets/texture/elevator/base.png');
            elevatorStairsTexture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
            const elevatorBgTexture = await Pixi.Texture.fromURL('./assets/texture/elevator/backCage.png');
            elevatorBgTexture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
            this.textures.set(TextureTypes.Elevator, [elevatorTexture, elevatorCageTexture, elevatorStairsTexture, elevatorBgTexture]);
        }

        if (!this.textures.has(TextureTypes.Hud)) {
            const hudPanelTexture = await Pixi.Texture.fromURL('./assets/texture/hud/hudPanel.png');
            const hudWalletTexture = await Pixi.Texture.fromURL('./assets/texture/hud/hudWallet.png');
            const hudNextHighTexture = await Pixi.Texture.fromURL('./assets/texture/hud/next_high.png');
            const hudNextMidTexture = await Pixi.Texture.fromURL('./assets/texture/hud/next_mid.png');
            const hudNextLowTexture = await Pixi.Texture.fromURL('./assets/texture/hud/next_low.png');
            const getOutBtnTexture = await Pixi.Texture.fromURL('./assets/texture/hud/get_out.png');
            const difficultyHighlightSprite = await Pixi.Texture.fromURL('./assets/texture/hud/difficulty_select.png');
            const getOutDisabledBtnTexture = await Pixi.Texture.fromURL('./assets/texture/hud/get_out_disable.png');
            this.textures.set(TextureTypes.Hud, [
                hudPanelTexture,
                hudWalletTexture,
                hudNextHighTexture,
                hudNextMidTexture,
                hudNextLowTexture,
                getOutBtnTexture,
                difficultyHighlightSprite,
                getOutDisabledBtnTexture,
            ]);
        }
    }

    private async loadTileTextures(): Promise<void> {
        if (!this.textures.has(TextureTypes.Tiles)) {
            const textures = [];
            for (let t = 0; t < assetTexturePaths[this.currentTextureFormat].length; t++) {
                const texture = await Pixi.Texture.fromURL(assetTexturePaths[this.currentTextureFormat][t]);
                texture.baseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
                textures.push(texture);
            }
            const emptyTexture = await Pixi.Texture.fromURL('./assets/texture/empty.png');
            textures.push(emptyTexture);

            this.textures.set(TextureTypes.Tiles, [...textures]);
        }
    }

    private update(currentTime: number): void {
        TWEEN.update();

        if (this.lastTime === 0 || this.lastTime === undefined) {
            this.lastTime = currentTime;
        }
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.updateBasedOnGameState(deltaTime);
        requestAnimationFrame(this.update);
    }

    private updateBasedOnGameState(deltaTime: number): void {
        switch (this.gameState) {
            case GameState.Idle:
                this.timeLeft -= deltaTime;
                this.onUpdateTimer(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    void this.changeGameState(GameState.DropElevator);
                }
                break;
            case GameState.IdleDrop:
                this.timeLeft -= deltaTime;
                this.onUpdateTimer(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    void this.changeGameState(GameState.MoveTiles);
                }
                break;
            case GameState.MoveTiles:
                this.timeLeft -= deltaTime;
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                }
                break;
            default:
                break;
        }
    }

    private async changeGameState(newState: GameState): Promise<void> {
        if (this.gameState === newState) {
            return;
        }
        this.gameState = newState;
        switch (this.gameState) {
            case GameState.Idle:
                break;
            case GameState.DropElevator:
                if (!this.hasBet) {
                    this.hasBet = true;
                    this.hasGottenOut = true;
                    this.onBetGetOutPress();
                }
                this.onUpdateStakeMultiplier();
                this.enableTimer(false);
                const maxDrops = 3;
                const minDrops = 1;
                this.amountOfDrops = Math.floor(Math.random() * (maxDrops - minDrops + 1)) + minDrops; // Set timer to drop time
                console.error(`Amount of stops: ${this.amountOfDrops}`);
                this.dropElevator();
                break;
            case GameState.IdleDrop:
                break;
            case GameState.MoveTiles:
                this.enableTimer(false);
                this.onUpdateStakeMultiplier();
                const minTime = 3;
                const maxTime = 8;
                this.dropsDone++;
                this.timeLeft = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime; // Set timer to drop time
                this.sectionsLeft = Math.ceil((this.timeLeft * 1000) / this.timePerSection);
                console.error(`Drop duration: ~${this.timeLeft} over ~${this.sectionsLeft}`);
                this.elevator!.parent?.removeChild(this.elevator!);
                this.phoneContainer.addChild(this.elevator!);
                await this.moveTiles();
                break;
            case GameState.StopDrop:
                this.timeLeft = this.timePerIdle;
                if (this.dropsDone % 3 === 0) {
                    this.dropsDone = 0;
                    this.layer++;
                }
                this.stakeIndex++;
                this.amountOfDrops--;
                if (this.amountOfDrops >= 0) {
                    this.enableTimer(true);
                    void this.changeGameState(GameState.IdleDrop);
                } else {
                    this.crashElevator();
                }
                break;
            default:
                break;
        }
    }

    private createButtons(): void {
        const width = 192;
        const height = 40;
        const margin = 5;
        const beginY = height * 2;

        // Phone Format
        this.phoneFormatLabel = new UIElement('Current Phone Format', height + margin, beginY, width, height, undefined);
        const phoneFormatNextButton = new UIElement(
            '>',
            this.phoneFormatLabel.bounds.right + margin,
            this.phoneFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onPhoneFormatChange(this.currentPhoneFormatIndex + 1);
                await this.createAssets();
            }
        );
        const phoneFormatPreviousButton = new UIElement(
            '<',
            this.phoneFormatLabel.bounds.left - margin - height,
            this.phoneFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onPhoneFormatChange(this.currentPhoneFormatIndex - 1);
                await this.createAssets();
            }
        );
        this.mainContainer.addChild(this.phoneFormatLabel.container);
        this.mainContainer.addChild(phoneFormatNextButton.container);
        this.mainContainer.addChild(phoneFormatPreviousButton.container);

        // Texture format Format
        this.textureFormatLabel = new UIElement(
            'Create tiles',
            this.phoneFormatLabel.bounds.left,
            this.phoneFormatLabel.bounds.top + margin + height,
            width,
            height,
            undefined
        );
        const textureFormatNextButton = new UIElement(
            '>',
            this.textureFormatLabel.bounds.right + margin,
            this.textureFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onTextureFormatChange(this.currentTextureFormatIndex + 1);
                await this.createAssets();
            }
        );
        const textureFormatPreviousButton = new UIElement(
            '<',
            this.textureFormatLabel.bounds.left - margin - height,
            this.textureFormatLabel.bounds.top,
            height,
            height,
            async () => {
                this.onTextureFormatChange(this.currentTextureFormatIndex - 1);
                await this.createAssets();
            }
        );
        this.mainContainer.addChild(this.textureFormatLabel.container);
        this.mainContainer.addChild(textureFormatNextButton.container);
        this.mainContainer.addChild(textureFormatPreviousButton.container);

        // Scaling Tiles
        this.scaleLabel = new UIElement(
            'Scale: ',
            this.textureFormatLabel.bounds.left,
            this.textureFormatLabel.bounds.top + margin + height,
            width,
            height,
            undefined
        );
        const scaleNextButton = new UIElement('>', this.scaleLabel.bounds.right + margin, this.scaleLabel.bounds.top, height, height, async () => {
            this.onScaleChange(this.currentScale + this.getScaleIncrements());
            await this.createAssets();
        });
        const scalePreviousButton = new UIElement(
            '<',
            this.scaleLabel.bounds.left - margin - height,
            this.scaleLabel.bounds.top,
            height,
            height,
            async () => {
                this.onScaleChange(this.currentScale - this.getScaleIncrements());
                await this.createAssets();
            }
        );
        this.scaleSettingContainer.addChild(this.scaleLabel.container);
        this.scaleSettingContainer.addChild(scaleNextButton.container);
        this.scaleSettingContainer.addChild(scalePreviousButton.container);
    }

    private async createHud(): Promise<void> {
        const dimension = phoneFormatDimensions[this.currentPhoneFormat];
        const hudScaling = dimension.w / 1080;
        const sprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![0]);
        sprite.scale.set(hudScaling, hudScaling);
        sprite.position.set(0, dimension.h - 973 * hudScaling);
        this.hudSprites.push(sprite);
        this.hudContainer.addChild(sprite);

        const sprite2 = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![1]);
        sprite2.scale.set(hudScaling, hudScaling);
        this.hudSprites.push(sprite2);
        this.hudContainer.addChild(sprite2);

        this.nextHighSprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![2]);
        this.hudSprites.push(this.nextHighSprite);
        this.nextHighSprite.position.set(dimension.w - 459 * hudScaling, 1250 * hudScaling);
        this.hudContainer.addChild(this.nextHighSprite);

        this.nextMidSprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![3]);
        this.hudSprites.push(this.nextMidSprite);
        this.nextMidSprite.position.set(dimension.w - 459 * hudScaling, 1250 * hudScaling);
        this.nextMidSprite.visible = false;
        this.hudContainer.addChild(this.nextMidSprite);

        this.nextLowSprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![4]);
        this.hudSprites.push(this.nextLowSprite);
        this.nextLowSprite.position.set(dimension.w - 459 * hudScaling, 1250 * hudScaling);
        this.nextLowSprite.visible = false;
        this.hudContainer.addChild(this.nextLowSprite);

        this.getOutButtonSprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![5]);
        this.hudSprites.push(this.getOutButtonSprite);
        this.getOutButtonSprite.position.set(665 * hudScaling, 1525 * hudScaling);
        this.getOutButtonSprite.visible = false;
        this.hudContainer.addChild(this.getOutButtonSprite);

        this.getOutDisabledButtonSprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![7]);
        this.hudSprites.push(this.getOutDisabledButtonSprite);
        this.getOutDisabledButtonSprite.position.set(665 * hudScaling, 1525 * hudScaling);
        this.getOutDisabledButtonSprite.visible = false;
        this.hudContainer.addChild(this.getOutDisabledButtonSprite);

        this.hudContainer.position.set(this.topLeft.x, this.topLeft.y);

        this.betLabel = new UIElement('BET', 0, 0, 0, 0, undefined, 0x000000, {
            fontFamily: 'upheavtt',
            fontSize: 20,
        });
        this.betLabel.changeTextColor(0x000000);
        this.hudContainer.addChild(this.betLabel.container);

        this.difficultyLabel = this.betLabel.createDuplicate('DIFFICULTY');
        this.difficultyLabel.changeTextColor(0x000000);
        this.hudContainer.addChild(this.difficultyLabel.container);

        this.autoLabel = this.betLabel.createDuplicate('AUTO');
        this.autoLabel.changeTextColor(0x000000);
        this.hudContainer.addChild(this.autoLabel.container);

        this.getOutLabel = this.betLabel.createDuplicate('BET', undefined, 0x000000, {
            wordWrap: true,
            wordWrapWidth: 100,
            fontSize: 28,
        });
        this.hudContainer.addChild(this.getOutLabel.container);

        this.nextLabel = this.getOutLabel.createDuplicate('NEXT :');
        this.hudContainer.addChild(this.nextLabel.container);

        for (let i = 1; i < 5; i++) {
            const labelString = i > 3 ? 'IV' : 'I'.repeat(i);
            const element = this.difficultyLabel.createDuplicate(labelString);
            const sprite = new Pixi.Sprite(this.textures.get(TextureTypes.Hud)![6]);
            this.hudSprites.push(sprite);

            const button = new UIElement(
                '',
                0,
                0,
                sprite.width * hudScaling,
                (sprite.height + 10) * hudScaling,
                () => {
                    this.onDifficultyChange(i);
                },
                0xff0000,
                {},
                true
            );

            this.difficultyMapHighlights.set(i, sprite);
            this.hudContainer.addChild(sprite);
            this.difficultyMapText.set(i, element);
            this.hudContainer.addChild(element.container);
            this.difficultyMapButtons.set(i, button);
            this.hudContainer.addChild(button.container);
        }

        this.betButton = new UIElement(
            '',
            0,
            0,
            this.getOutButtonSprite.width * hudScaling,
            this.getOutButtonSprite.height * hudScaling,
            () => {
                this.onBetGetOutPress();
            },
            0xff0000,
            {},
            true
        );
        this.hudContainer.addChild(this.betButton.container);

        this.currentBetText = this.betLabel.createDuplicate('$ 2.50');
        this.hudContainer.addChild(this.currentBetText.container);

        this.currentWalletText = this.currentBetText.createDuplicate('$ 2007.50', undefined, 0x0, {
            fontSize: 16,
        });
        this.currentWalletText.changeTextColor(0x000000);
        this.hudContainer.addChild(this.currentWalletText.container);

        this.nextTimer = this.nextLabel.createDuplicate('00 : 00', undefined, 0x0, {
            fontSize: 24,
        });
        this.hudContainer.addChild(this.nextTimer.container);

        this.stakeMultiplierText = this.nextLabel.createDuplicate('-');
        this.stakeMultiplierText.changeTextColor(0x25fd88);
        this.hudContainer.addChild(this.stakeMultiplierText.container);

        this.updateHudTransforms();
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

    private async createAssets(): Promise<void> {
        this.disposeTilePage();
        this.createTiles(beginTileMapGuide);
        await this.createElevator();
        await this.createCharacters();
        this.updateTransforms();
    }

    private createTiles(guide: number[][]): void {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let tileId = guide[r][c];
                if (tileId === 3) {
                    tileId += this.layer;
                }
                const texture = this.textures.get(TextureTypes.Tiles)![tileId];
                const emptyTexture = this.textures.get(TextureTypes.Tiles)![this.textures.get(TextureTypes.Tiles)!.length - 1];
                let sprite = new Pixi.Sprite(texture ?? emptyTexture);
                this.tiles[this.tilesIndex].push(sprite);
                this.tilePageContainer[this.tilesIndex].addChild(sprite);
            }
        }
    }

    private async createCharacters(): Promise<void> {
        const charScaled = 0.6;
        for (let i = 0; i < 5; i++) {
            const charSprite = new Pixi.Sprite(this.textures.get(TextureTypes.Character)![0]);
            charSprite.scale.set(
                charScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
                charScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
            );
            this.characters.push(charSprite);
            this.phoneContainer.addChild(charSprite);
        }
    }

    private async createElevator(): Promise<void> {
        const elevatorScaled = 0.25;

        this.elevator = new Pixi.Sprite(this.textures.get(TextureTypes.Elevator)![0]);
        this.elevator.scale.set(
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
        );

        this.elevatorCage = new Pixi.Sprite(this.textures.get(TextureTypes.Elevator)![1]);
        this.elevatorCage.scale.set(
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
        );

        this.elevatorStairs = new Pixi.Sprite(this.textures.get(TextureTypes.Elevator)![2]);
        this.elevatorStairs.scale.set(
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
        );

        this.elevatorBg = new Pixi.Sprite(this.textures.get(TextureTypes.Elevator)![3]);
        this.elevatorBg.scale.set(
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            elevatorScaled * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s
        );

        this.tilePageContainer[0].addChild(this.elevatorBg);
        this.tilePageContainer[0].addChild(this.elevator);
        this.tilePageContainer[0].addChild(this.elevatorStairs);
        this.tilePageContainer[0].addChild(this.elevatorCage);
    }

    private updateTransforms(): void {
        // Tiles
        for (let i = 0; i < this.tiles[0].length; i++) {
            const row = Math.floor(i / COLS);
            const column = i % COLS;
            this.tiles[0][i].position.set(
                this.topLeft.x + column * this.tiles[0][i]!.height * this.currentScale,
                this.topLeft.y + row * this.tiles[0][i]!.width * this.currentScale
            );
            this.tiles[0][i].scale.set(this.currentScale, this.currentScale);
        }

        // Characters
        const charBeginPos = { x: 6, y: 4 };
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
                (elevatorBeginPos.y * TILESIZE - 6) * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                this.elevator!.height
        );

        const elevatorStairsBeginPos = { x: 0, y: 4 };
        this.elevatorStairs!.position.set(
            this.topLeft.x + elevatorStairsBeginPos.x * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            this.topLeft.y +
                elevatorStairsBeginPos.y * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                this.elevatorStairs!.height
        );

        const elevatorCageBeginPos = { x: 0, y: 4 };
        this.elevatorCage!.position.set(
            this.topLeft.x + elevatorCageBeginPos.x * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            this.topLeft.y +
                (elevatorCageBeginPos.y * TILESIZE - 6) * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                this.elevatorCage!.height
        );

        const elevatorBgBeginPos = { x: 2, y: 4 };
        this.elevatorBg!.position.set(
            this.topLeft.x + elevatorBgBeginPos.x * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            this.topLeft.y +
                (elevatorBgBeginPos.y * TILESIZE - 6) * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                this.elevatorBg!.height
        );
        this.updateHudTransforms();
    }

    private getElevatorPosition(depth: number): { x: number; y: number } {
        return {
            x: this.topLeft.x + 1 * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s,
            y:
                this.topLeft.y +
                depth * TILESIZE * this.mapSavedSettings[this.currentPhoneFormat][TextureFormatTypes.Default32].s -
                this.elevator!.height,
        };
    }

    private updateHudTransforms(): void {
        const dimension = phoneFormatDimensions[this.currentPhoneFormat];
        const hudScaling = dimension.w / 1080;
        this.hudSprites.forEach((sprite: Pixi.Sprite, index: number) => {
            if (index === 0) {
                sprite.position.set(0, dimension.h - 973 * hudScaling);
            }
            sprite.scale.set(hudScaling, hudScaling);
        });
        this.nextLowSprite?.position.set(dimension.w - 459 * hudScaling, dimension.h - 660 * hudScaling);
        this.nextMidSprite?.position.set(dimension.w - 459 * hudScaling, dimension.h - 660 * hudScaling);
        this.nextHighSprite?.position.set(dimension.w - 459 * hudScaling, dimension.h - 660 * hudScaling);
        this.hudContainer.position.set(this.topLeft.x, this.topLeft.y);

        const originalDimensions = phoneFormatDimensions[PhoneFormatTypes.IPhoneSE];
        const dimensionsScalingW = dimension.w / originalDimensions.w;
        this.betLabel?.container.position.set(55 * dimensionsScalingW, dimension.h - 325 * hudScaling);
        this.difficultyLabel?.container.position.set(172 * dimensionsScalingW, dimension.h - 325 * hudScaling);
        this.autoLabel?.container.position.set(40 * dimensionsScalingW, dimension.h - 75 * hudScaling);
        this.getOutLabel?.container.position.set(300 * dimensionsScalingW, dimension.h - 250 * hudScaling);
        this.nextLabel?.container.position.set(285 * dimensionsScalingW, dimension.h - 610 * hudScaling);
        this.nextTimer?.container.position.set(285 * dimensionsScalingW, dimension.h - 530 * hudScaling);
        this.stakeMultiplierText?.container.position.set(80 * dimensionsScalingW, dimension.h - 590 * hudScaling);
        this.betButton?.container.position.set(240 * dimensionsScalingW, dimension.h - 393 * hudScaling);

        this.currentBetText?.container.position.set(55 * dimensionsScalingW, dimension.h - 220 * hudScaling);
        this.currentWalletText?.container.position.set(255 * dimensionsScalingW, 100 * hudScaling);

        for (let i = 1; i < 5; i++) {
            const row = Math.floor((i - 1) / 2);
            const column = (i - 1) % 2;
            const h = 25;
            const h2 = 30;
            const w = 55;
            const highlight = this.difficultyMapHighlights.get(i)!;
            const label = this.difficultyMapText.get(i)!;
            const button = this.difficultyMapButtons.get(i)!;

            label.container.position.set(145 * dimensionsScalingW + column * w, dimension.h - 255 * hudScaling + row * h);

            highlight.position.set(117 * dimensionsScalingW + column * w, dimension.h - 277 * hudScaling + row * h2);
            button.container.position.set(117 * dimensionsScalingW + column * w, dimension.h - 277 * hudScaling + row * h);
            if (column === 1) {
                highlight.scale.set(-highlight.scale.x, highlight.scale.y);
                highlight.position.set(highlight.position.x + 55, highlight.position.y);
            }
            if (row === 1) {
                highlight.scale.set(highlight.scale.x, -highlight.scale.y);
                highlight.position.set(highlight.position.x, highlight.position.y + 25 * 0.5);
            }
        }
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
    }

    private async onTextureFormatChange(index: number): Promise<void> {
        if (this.currentTextureFormatIndex === index) {
            console.error('same texture type skipping');
            return;
        }
        const values = Object.values(TextureFormatTypes);
        this.currentTextureFormatIndex = index;
        if (this.currentTextureFormatIndex < 0) {
            this.currentTextureFormatIndex = values.length - 1;
        }
        if (this.currentTextureFormatIndex >= values.length) {
            this.currentTextureFormatIndex = 0;
        }

        this.disposeTileTextures();
        this.currentTextureFormat = values[this.currentTextureFormatIndex] as TextureFormatTypes;
        this.textureFormatLabel.changeText(this.currentTextureFormat);
        await this.loadTileTextures();

        this.scaleSettingContainer.visible = this.currentTextureFormat !== TextureFormatTypes.None;

        this.onScaleChange(this.mapSavedSettings[this.currentPhoneFormat][this.currentTextureFormat].s);
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

    private onBetGetOutPress(): void {
        if (this.gameState === GameState.Idle) {
            if (!this.hasBet) {
                this.hasBet = true;
            }
        }

        if (this.gameState === GameState.IdleDrop && this.hasBet) {
            if (!this.hasGottenOut) {
                this.hasGottenOut = true;
            }
        }

        this.getOutButtonSprite!.visible = this.hasBet && !this.hasGottenOut;
        this.getOutDisabledButtonSprite!.visible = this.hasBet && this.hasGottenOut;
        this.getOutLabel!.changeText(this.hasBet ? (this.hasGottenOut ? 'WAIT' : 'GET OUT') : 'BET');
    }

    private onDifficultyChange(difficulty: number): void {
        if (this.gameState === GameState.Idle) {
            this.difficultyMapHighlights.forEach((sprite: Pixi.Sprite, index: number) => {
                sprite.visible = index === difficulty;
                if (index === difficulty) {
                    this.currentDifficulty = index;
                }
            });
            this.onUpdateStakeMultiplier();
            this.difficultyMapText.forEach((text: UIElement, index: number) => {
                text.changeTextColor(index === difficulty ? 0xffffff : 0x000000);
            });
        }
    }

    private onUpdateStakeMultiplier(): void {
        if (this.stakeMultiplierText) {
            const multiInfo = multipliers[this.currentDifficulty];
            const stake = getPointOnCurve(this.stakeIndex, multiInfo.b, multiInfo.e);
            this.stakeMultiplierText.changeText(`x${stake.toFixed(2)}`);
        }
    }

    private onUpdateTimer(time: number): void {
        const seconds = Math.ceil(time);
        this.nextTimer?.changeText(`00 : ${seconds < 10 ? '0' : ''}${seconds}`);
        if (this.nextLowSprite) {
            this.nextLowSprite.visible = seconds <= 3;
        }
        if (this.nextMidSprite) {
            this.nextMidSprite.visible = seconds > 3 && seconds <= 6;
        }
        if (this.nextHighSprite) {
            this.nextHighSprite.visible = seconds > 6;
        }
    }

    private enableTimer(active: boolean = true): void {
        this.nextTimer!.container.visible = active;
        this.nextLabel!.container.visible = active;
        this.nextHighSprite!.visible = active;
        this.nextMidSprite!.visible = active;
        this.nextLowSprite!.visible = active;
    }

    private async dropElevator(): Promise<void> {
        const elevatorGoalPos = this.getElevatorPosition(11);
        new TWEEN.Tween(this.elevator!.position)
            .to(elevatorGoalPos, 350)
            .easing(TWEEN.Easing.Linear.InOut)
            .start()
            .onComplete(async () => {
                await this.changeGameState(GameState.MoveTiles);
            });
    }

    private async moveTiles(): Promise<void> {
        if (this.sectionsLeft <= 0) {
            void this.changeGameState(GameState.StopDrop);
            return;
        }
        this.sectionsLeft--;
        await this.prepareNextSetTiles();
        new TWEEN.Tween(this.tilePageContainer[this.tilesIndex === 0 ? 1 : 0].position)
            .to({ x: 0, y: -ROWS * TILESIZE }, this.timePerSection)
            .easing(TWEEN.Easing.Linear.InOut)
            .start();
        new TWEEN.Tween(this.tilePageContainer[this.tilesIndex].position)
            .to({ x: 0, y: 0 }, this.timePerSection)
            .easing(TWEEN.Easing.Linear.InOut)
            .start()
            .onComplete(async () => {
                this.tilePageContainer[this.tilesIndex === 0 ? 1 : 0].position.set(0, ROWS * TILESIZE);
                if (this.gameState === GameState.MoveTiles) {
                    void this.moveTiles();
                }
            });
    }

    private async prepareNextSetTiles(): Promise<void> {
        this.tilesIndex++;
        this.tilesIndex %= 2;
        this.disposeTilePage();
        this.createTiles(this.sectionsLeft === 0 ? dropStopTileMapGuide : dropTileMapGuide);
        for (let i = 0; i < this.tiles[this.tilesIndex].length; i++) {
            const row = Math.floor(i / COLS);
            const column = i % COLS;
            this.tiles[this.tilesIndex][i].position.set(
                this.topLeft.x + column * this.tiles[this.tilesIndex][i]!.height * this.currentScale,
                this.topLeft.y + row * this.tiles[this.tilesIndex][i]!.width * this.currentScale
            );
            this.tiles[this.tilesIndex][i].scale.set(this.currentScale, this.currentScale);
        }
    }

    private async crashElevator(): Promise<void> {
        const elevatorGoalPos = this.getElevatorPosition(32);
        new TWEEN.Tween(this.elevator!.position)
            .to(elevatorGoalPos, 350)
            .easing(TWEEN.Easing.Linear.InOut)
            .start()
            .onComplete(async () => {
                // TODO: Reset
                // await this.changeGameState(GameState.MoveTiles);
            });
    }

    public disposeTilePage(): void {
        this.tilePageContainer[this.tilesIndex].children.forEach((obj: Pixi.DisplayObject) => {
            obj.destroy();
        });
        this.tiles[this.tilesIndex] = [];
        this.tilePageContainer[this.tilesIndex].removeChildren();
    }

    public disposeTileTextures(): void {
        const textures = this.textures.get(TextureTypes.Tiles);
        if (textures === undefined) {
            return;
        }
        for (let i = 0; i < textures.length; i++) {
            textures[i].destroy();
        }
        this.textures.delete(TextureTypes.Tiles);
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
