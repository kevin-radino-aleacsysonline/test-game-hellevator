import { PhoneFormatTypes } from '../types/phoneFormatTypes';
import { TextureFormatTypes } from '../types/textureFormatTypes';

export const assetTexturePaths: Record<TextureFormatTypes, string[]> = {
    [TextureFormatTypes.Default32]: [
        './assets/texture/32/backgroundBackTile_1.png',
        './assets/texture/32/backgroundBackTile_2.png',
        './assets/texture/32/backgroundBackTile_3.png',
        './assets/texture/32/character.png',
        './assets/texture/32/level1.png',
        './assets/texture/32/level2.png',
        './assets/texture/32/level3.png',
        './assets/texture/32/level4.png',
        './assets/texture/32/level5.png',
        './assets/texture/32/level6.png',
        './assets/texture/32/level7.png',
        './assets/texture/32/level8.png',
    ],
    [TextureFormatTypes.Scaled32To128]: [
        './assets/texture/32s128/backgroundBackTile_1.png',
        './assets/texture/32s128/backgroundBackTile_2.png',
        './assets/texture/32s128/backgroundBackTile_3.png',
        './assets/texture/32s128/character.png',
        './assets/texture/32s128/level1.png',
        './assets/texture/32s128/level2.png',
        './assets/texture/32s128/level3.png',
        './assets/texture/32s128/level4.png',
        './assets/texture/32s128/level5.png',
        './assets/texture/32s128/level6.png',
        './assets/texture/32s128/level7.png',
        './assets/texture/32s128/level8.png',
    ],
};

export const sizePerFormoat: Record<TextureFormatTypes, number> = {
    [TextureFormatTypes.Default32]: 32,
    [TextureFormatTypes.Scaled32To128]: 128,
};

export const rows = 32;
export const cols = 16;

export const phoneFormatDimensions: Record<PhoneFormatTypes, { w: number; h: number }> = {
    [PhoneFormatTypes.IPhoneSE]: { w: 375, h: 667 },
    [PhoneFormatTypes.IPhoneXR]: { w: 414, h: 896 },
    [PhoneFormatTypes.IPhone12Pro]: { w: 390, h: 844 },
    [PhoneFormatTypes.IPhone14ProMax]: { w: 430, h: 932 },
    [PhoneFormatTypes.Pixel7]: { w: 412, h: 915 },
    [PhoneFormatTypes.SamsungGalaxyS8Plus]: { w: 360, h: 740 },
    [PhoneFormatTypes.SamsungGalaxyS20Ultra]: { w: 412, h: 915 },
};
