export class Asset {}

export namespace AssetManager {
    export class Bundle {
        load = jest.fn();
    }
}

export interface IAssetManager {
    loadRemote<T extends Asset>(url: string, onComplete?: ((err: Error | null, data: T) => void) | null): void;
    loadBundle(nameOrUrl: string, onComplete?: ((err: Error | null, data: AssetManager.Bundle) => void) | null): void;
}

export const assetManager: IAssetManager = {
    loadBundle: jest
        .fn()
        .mockImplementation((nameOrUrl: string, onComplete?: ((err: Error | null, data: AssetManager.Bundle) => void) | null): void => {
            if (onComplete) {
                onComplete(null, new AssetManager.Bundle());
            }
        }),
    loadRemote: jest.fn().mockImplementation(<T extends Asset>(url: string, onComplete?: ((err: Error | null, data: T) => void) | null): void => {
        if (onComplete) {
            onComplete(null, {} as T);
        }
    }),
};

export const log = jest.fn();
export const warn = jest.fn();
export const error = jest.fn();
