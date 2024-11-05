import * as Pixi from 'Pixi.js';
import _ from 'lodash';
import { ZippedResource } from './models/zippedResource';

export interface IProject {
    launch(): void;
}

const assetTexturePaths = [
    './assets/texture/dice/die1.png',
    './assets/texture/dice/die2.png',
    './assets/texture/dice/die3.png',
    './assets/texture/dice/die4.png',
    './assets/texture/dice/die5.png',
    './assets/texture/dice/die6.png',
    './assets/texture/dice/die7.png',
    './assets/texture/dice/die8.png',
    './assets/texture/dice/die9.png',
    './assets/texture/dice/die10.png',
    './assets/texture/feature/backgroundBonusGame.png',
    './assets/texture/feature/gridBonusGame.png',
    './assets/texture/feature/skyBonusBackground.jpg',
    './assets/texture/main/backgroundWaterMainGame.jpg',
    './assets/texture/main/gridMainGame.png',
    './assets/texture/splashScreen/splashScreenBonus.png',
    './assets/texture/splashScreen/splashScreenNormal.png',
    './assets/texture/transition/groundLayers.jpg',

    './assets/textureAtlas/blueBonus/blueChanchu.png',

    './assets/textureAtlas/bonus/blueCoin.png',
    './assets/textureAtlas/bonus/bonus_freespinCoin.png',
    './assets/textureAtlas/bonus/bonusWheel.png',
    './assets/textureAtlas/bonus/greenCoin.png',
    './assets/textureAtlas/bonus/redCoin.png',
    './assets/textureAtlas/bonus/segmentHighlight.png',
    './assets/textureAtlas/bonus/wheelArrow.png',
    './assets/textureAtlas/bonus/wheelBorder.png',
    './assets/textureAtlas/bonus/wheelGlow.png',
    './assets/textureAtlas/bonus/wheelOverlay.png',
    './assets/textureAtlas/bonus/wheelSegments.png',

    './assets/textureAtlas/burst/coinburstFrame.png',
    './assets/textureAtlas/burst/featureSpinsAmount.png',
    './assets/textureAtlas/burst/frameCoinBurst.png',

    './assets/textureAtlas/clouds/cloudBackground1.png',
    './assets/textureAtlas/clouds/cloudBackground2.png',
    './assets/textureAtlas/clouds/cloudBackground3.png',
    './assets/textureAtlas/clouds/cloudBackground4.png',
    './assets/textureAtlas/clouds/cloudBackground5.png',
    './assets/textureAtlas/clouds/cloudBackground6.png',

    './assets/textureAtlas/diceLarge/die1.png',
    './assets/textureAtlas/diceLarge/die2.png',
    './assets/textureAtlas/diceLarge/die3.png',
    './assets/textureAtlas/diceLarge/die4.png',
    './assets/textureAtlas/diceLarge/die5.png',
    './assets/textureAtlas/diceLarge/die6.png',
    './assets/textureAtlas/diceLarge/die7.png',
    './assets/textureAtlas/diceLarge/die8.png',
    './assets/textureAtlas/diceLarge/die9.png',

    './assets/textureAtlas/freeSpins/blueLantern.png',
    './assets/textureAtlas/freeSpins/freeSpinPlaque.png',
    './assets/textureAtlas/freeSpins/greenLantern.png',
    './assets/textureAtlas/freeSpins/leftDoor.png',
    './assets/textureAtlas/freeSpins/redLantern.png',
    './assets/textureAtlas/freeSpins/rightDoor.png',
    './assets/textureAtlas/freeSpins/spinDie.png',

    './assets/textureAtlas/greenBonus/greenTerracotta.png',

    './assets/textureAtlas/gridBackPlates/grid0_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid0_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid0_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid1_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid1_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid1_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid2_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid2_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid2_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid3_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid3_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid3_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid4_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid4_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid4_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid5_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid5_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid5_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid6_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid6_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid6_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid7_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid7_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid7_2.jpg',
    './assets/textureAtlas/gridBackPlates/grid8_0.jpg',
    './assets/textureAtlas/gridBackPlates/grid8_1.jpg',
    './assets/textureAtlas/gridBackPlates/grid8_2.jpg',

    './assets/textureAtlas/grids/gridAllMysteryPT.png',
    './assets/textureAtlas/grids/gridAllPT.png',
    './assets/textureAtlas/grids/gridMidLS.png',
    './assets/textureAtlas/grids/gridMidMysteryLS.png',
    './assets/textureAtlas/grids/gridPoints.png',
    './assets/textureAtlas/grids/gridSideLS.png',
    './assets/textureAtlas/grids/gridSideMysteryLS.png',
    './assets/textureAtlas/grids/jackpotField.png',

    './assets/textureAtlas/info/multipliers.png',
    './assets/textureAtlas/info/page1BonusGame.png',
    './assets/textureAtlas/info/page1MainGame.png',
    './assets/textureAtlas/info/page2Grids.png',
    './assets/textureAtlas/info/page2MainGame.png',
    './assets/textureAtlas/info/page2Points.png',
    './assets/textureAtlas/info/page2Prizes.png',
    './assets/textureAtlas/info/page3BonusWheel.png',
    './assets/textureAtlas/info/page3Bonuswinline.png',
    './assets/textureAtlas/info/page3Multiplier9Alike.png',
    './assets/textureAtlas/info/page3MultiplierX2.png',
    './assets/textureAtlas/info/page3MultiplierX3.png',
    './assets/textureAtlas/info/page3PrizeTable.png',
    './assets/textureAtlas/info/page3Scatters.png',
    './assets/textureAtlas/info/page3Wild.png',
    './assets/textureAtlas/info/page4Bastet.png',
    './assets/textureAtlas/info/page4BookOfDice.png',
    './assets/textureAtlas/info/page49AlikeWheel.jpg',

    './assets/textureAtlas/main/alike9Lit.png',
    './assets/textureAtlas/main/alike9Unlit.png',
    './assets/textureAtlas/main/bokeBig.png',
    './assets/textureAtlas/main/bokeBlur.png',
    './assets/textureAtlas/main/bokeMini.png',
    './assets/textureAtlas/main/bookIconHighlighted.png',
    './assets/textureAtlas/main/bookIconNonHighlighted.png',
    './assets/textureAtlas/main/buffer.png',
    './assets/textureAtlas/main/bufferFrame.png',
    './assets/textureAtlas/main/bufferMystery.png',
    './assets/textureAtlas/main/close.png',
    './assets/textureAtlas/main/darkOverlayGrid.png',
    './assets/textureAtlas/main/die1.png',
    './assets/textureAtlas/main/die2.png',
    './assets/textureAtlas/main/die3.png',
    './assets/textureAtlas/main/die4.png',
    './assets/textureAtlas/main/die5.png',
    './assets/textureAtlas/main/die6.png',
    './assets/textureAtlas/main/die7.png',
    './assets/textureAtlas/main/die8.png',
    './assets/textureAtlas/main/die9.png',
    './assets/textureAtlas/main/die10.png',
    './assets/textureAtlas/main/die11.png',
    './assets/textureAtlas/main/die12.png',
    './assets/textureAtlas/main/die13.png',
    './assets/textureAtlas/main/dieWhite.png',
    './assets/textureAtlas/main/expand.png',
    './assets/textureAtlas/main/gameLogo.png',
    './assets/textureAtlas/main/gridWonOverlay.png',
    './assets/textureAtlas/main/hexagon.png',
    './assets/textureAtlas/main/messageBar.png',
    './assets/textureAtlas/main/messageBarLS.png',
    './assets/textureAtlas/main/messageBarPT.png',
    './assets/textureAtlas/main/points.png',
    './assets/textureAtlas/main/pointsPlate.png',
    './assets/textureAtlas/main/prizeTable.png',
    './assets/textureAtlas/main/score.png',
    './assets/textureAtlas/main/set2Lit.png',
    './assets/textureAtlas/main/set2Unlit.png',
    './assets/textureAtlas/main/set3Lit.png',
    './assets/textureAtlas/main/set3Unlit.png',
    './assets/textureAtlas/main/tick.png',

    './assets/textureAtlas/pointsModifiers/200ModifierTxt.png',
    './assets/textureAtlas/pointsModifiers/alike9Icon.png',
    './assets/textureAtlas/pointsModifiers/L200TXT.png',
    './assets/textureAtlas/pointsModifiers/Lx1-5TXT.png',
    './assets/textureAtlas/pointsModifiers/Lx2TXT.png',
    './assets/textureAtlas/pointsModifiers/sets3Icon.png',
    './assets/textureAtlas/pointsModifiers/sets4Icon.png',
    './assets/textureAtlas/pointsModifiers/x1-5ModifierTxt.png',
    './assets/textureAtlas/pointsModifiers/x2ModifierTxt.png',

    './assets/textureAtlas/redBonus/redAttackElectric.png',
    './assets/textureAtlas/redBonus/redAttackRocks.png',
    './assets/textureAtlas/redBonus/redAttackScratch.png',
    './assets/textureAtlas/redBonus/redDragon.png',
    './assets/textureAtlas/redBonus/redIconElectric.png',
    './assets/textureAtlas/redBonus/redIconRocks.png',
    './assets/textureAtlas/redBonus/redIconScratch.png',
    './assets/textureAtlas/redBonus/redRollBlurr.png',
    './assets/textureAtlas/redBonus/redRolls.png',

    './assets/textureAtlas/score/prizeTable.png',
    './assets/textureAtlas/score/prizeTableLS.png',
    './assets/textureAtlas/score/prizeTablePointer.png',
    './assets/textureAtlas/score/prizeTablePT.png',
    './assets/textureAtlas/score/score.png',
    './assets/textureAtlas/score/scoreLS.png',
    './assets/textureAtlas/score/scorePT.png',
];

export class Project implements IProject {
    public zipperResource: ZippedResource;
    public container: Pixi.Container;
    public canvasApp: Pixi.Application<HTMLCanvasElement>;

    public PixiTextures: Pixi.Texture<Pixi.Resource>[];
    public PixiSprites: Pixi.Sprite[];

    public contentContainer: Pixi.Container;
    public saveContainer: Pixi.Container;
    public loadContainer: Pixi.Container;
    public soundContainer: Pixi.Container;
    public buttonTextMap: Map<string, Pixi.Text>;

    private isSaving = false;
    private isLoading = false;

    public async launch(): Promise<void> {
        this.canvasApp = new Pixi.Application<HTMLCanvasElement>({ background: '#1099bb', resizeTo: window });
        this.container = new Pixi.Container();
        this.contentContainer = new Pixi.Container();
        this.buttonTextMap = new Map<string, Pixi.Text>();

        this.container.addChild(this.contentContainer);

        this.PixiSprites = [];
        this.PixiTextures = [];
        this.canvasApp.stage.addChild(this.container);
        this.zipperResource = new ZippedResource();
        this.createButtons();
        document.body.appendChild(this.canvasApp.view);
    }

    public async createResources(): Promise<void> {
        const length = assetTexturePaths.length;
        for (let i = 0; i < length; i++) {
            const PixiTexture = await Pixi.Texture.fromURL(assetTexturePaths[i]);
            this.PixiTextures.push(PixiTexture);
            const PixiSprite = new Pixi.Sprite(PixiTexture);
            this.PixiSprites.push(PixiSprite);
            PixiSprite.position.set(
                _.random(PixiTexture.width * 0.5, this.canvasApp.screen.width - PixiTexture.width * 0.5),
                _.random(PixiTexture.height * 0.5, this.canvasApp.screen.height - PixiTexture.height * 0.5)
            );
        }

        this.PixiSprites.forEach((sprite: Pixi.Sprite) => {
            this.contentContainer.addChild(sprite);
        });
    }

    private createButtons(): void {
        const offset = 32;
        const width = 128;
        const height = 64;

        this.createButton('Save', this.saveContainer, width * 0.5, offset, width, async () => {
            if (this.isSaving) return;
            this.isSaving = true;
            console.log('Saving...');
            this.updateButtonText('Save', 'saving...');
            const time = Date.now();
            for (let i = 0; i < assetTexturePaths.length; i++) {
                await this.zipperResource.zipResource(assetTexturePaths[i]);
            }
            this.zipperResource.donwload();
            this.isSaving = false;
            console.log('Saved in ', time - Date.now(), ' ms');
            this.updateButtonText('Save', 'Save');
        });

        const scaleW = width * 1.5;
        this.createButton('Load local zip', this.soundContainer, width * 0.5, offset * 2 + height, scaleW, async () => {
            if (this.isLoading) return;
            this.isLoading = true;
            console.log('Loading...');
            this.updateButtonText('Load local zip', 'loading...');
            this.diposeTextures();
            let input: HTMLInputElement = document.createElement('input');
            input.type = 'file';
            input.onchange = async (_) => {
                const time1 = Date.now();
                if (input.files === undefined) return;
                const arry = Array.from(input.files!);
                const binaryFile = arry[0];
                const buffer = await binaryFile.arrayBuffer();
                this.zipperResource.setZipData(new Uint8Array(buffer));
                this.loadResourcesFromZip();
                console.log('Zipped files from local ', Date.now() - time1, 'ms');
            };
            input.click();
            this.isLoading = false;
            this.updateButtonText('Load local zip', 'Load local zip');
        });

        this.createButton('Load normal', this.soundContainer, width * 0.5 + scaleW + offset, offset * 2 + height, scaleW, async () => {
            if (this.isLoading) return;
            const time1 = Date.now();
            this.isLoading = true;
            console.log('Loading...');
            this.updateButtonText('Load normal', 'loading...');
            await this.createResources();
            this.isLoading = false;
            console.log('Files from assets ', Date.now() - time1, 'ms');
            this.updateButtonText('Load normal', 'Load normal');
        });
    }

    private updateButtonText(name: string, text: string): void {
        if (!this.buttonTextMap.has(name) || this.buttonTextMap.get(name) === undefined) {
            return;
        }

        this.buttonTextMap.get(name)!.text = text;
    }

    private createButton(name: string, container: Pixi.Container, x: number, y: number, w: number, callback: () => void): void {
        const h = 64;

        const g1 = new Pixi.Graphics();
        g1.beginFill(0x000000, 0.9);
        g1.drawRect(0, 0, w, h);
        g1.endFill();

        const text = new Pixi.Text(name, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
        });
        text.anchor.set(0.5, 0.5);
        text.position.set(w * 0.5, h * 0.5);
        this.buttonTextMap.set(name, text);

        container = new Pixi.Container();
        container.hitArea = new Pixi.Rectangle(0, 0, w, h);
        container.interactive = true;
        container.position.set(x, y);
        container.on('click', async () => {
            callback();
        });
        container.addChild(g1);
        container.addChild(text);
        this.container.addChild(container);
    }

    private loadResourcesFromZip(): void {
        for (let i = 0; i < assetTexturePaths.length; i++) {
            const texture = this.zipperResource.getPixiTexture(assetTexturePaths[i]);
            this.PixiTextures.push(texture);
            const sprite = new Pixi.Sprite(texture);
            sprite.position.set(
                _.random(texture.width * 0.5, this.canvasApp.screen.width - texture.width * 0.5),
                _.random(texture.height * 0.5, this.canvasApp.screen.height - texture.height * 0.5)
            );
            this.PixiSprites.push(sprite);
            this.contentContainer.addChild(sprite);
        }
    }

    public diposeTextures(): void {
        for (let i = 0; i < this.PixiTextures.length; i++) {
            Pixi.Texture.removeFromCache(this.PixiTextures[i]);
            this.PixiTextures[i].destroy();
            this.PixiSprites[i].removeFromParent();
            this.PixiSprites[i].destroy();
        }
        this.PixiTextures.splice(0);
        this.PixiSprites.splice(0);
    }
}
