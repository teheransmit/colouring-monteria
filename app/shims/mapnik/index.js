const sharp = require('sharp');

class Image {
    constructor(width, height) {
        this.width = width || 256;
        this.height = height || 256;
    }
    encode(format, cb) {
        sharp({
            create: {
                width: this.width,
                height: this.height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        }).png().toBuffer()
          .then(buf => cb(null, buf))
          .catch(err => cb(err));
    }
    save(path, cb) {
        if (cb) cb(null);
    }
    static open(path, cb) {
        if (cb) cb(null, new Image());
    }
}

class Map {
    constructor(w, h, proj) {
        this.width = w;
        this.height = h;
    }
    zoomToBox() {}
    render(im, cb) {
        if (cb) cb(null, im);
    }
}

class Layer {
    constructor(name, proj) {
        this.styles = [];
    }
}

class Datasource {
    constructor(conf) {}
}

const mapnik = {
    Image,
    Map,
    Layer,
    Datasource,
    register_default_input_plugins: () => {},
    register_default_fonts: () => {}
};

module.exports = mapnik;
