export class Image {
    width: number;
    height: number;
    constructor(width?: number, height?: number);
    encode(format: string, cb: (err: any, buffer: Buffer) => void): void;
    save(path: string, cb?: (err: any) => void): void;
    static open(path: string, cb?: (err: any, im: Image) => void): void;
}

export class Map {
    width: number;
    height: number;
    constructor(width: number, height: number, proj: string);
    zoomToBox(box: any): void;
    render(im: Image, cb: (err: any, im: Image) => void): void;
}

export class Layer {
    styles: string[];
    datasource: any;
    constructor(name: string, proj: string);
}

export class Datasource {
    constructor(conf: any);
}

export function register_default_input_plugins(): void;
export function register_default_fonts(): void;

declare const mapnik: {
    Image: typeof Image;
    Map: typeof Map;
    Layer: typeof Layer;
    Datasource: typeof Datasource;
    register_default_input_plugins: typeof register_default_input_plugins;
    register_default_fonts: typeof register_default_fonts;
};

export default mapnik;
