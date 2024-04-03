import {TextureLoader} from "three";

export class CC0TexturesHelper {
    /**
     *
     * @param materials_data: multi-line csv string of format: Wood047,dt6jmyec,1K-JPG|1K-PNG|2K-JPG|2K-PNG
     */
    constructor(materials_data = undefined) {
        /**
         * @type {[string, string, string[]][]}
         */
        this.materials = materials_data ? materials_data.trim().split('\n').map(value => value.split(',')) : undefined;
        if(this.materials)
            this.materials.forEach(value => value[value.length - 1] = value[value.length - 1].split('|'));
    }

    resolveMaterialLink(name, alpha = true) {
        if(!this.materials) return null;

        const i_ext = alpha ? "png" : "jpg";
        let material = this.materials.find(value => value[0] === name);
        if (!material) return null;

        let quality = 1;
        let raw_id = material[1];
        let ext = "zip";
        let forms = material[2];
        forms = forms.filter(value => value.toLowerCase().endsWith(i_ext));
        if (forms.length < 1) return null;
        let form = quality === 1 ? forms[0] : forms[forms.length - 1];
        // let link = 'https://cdn3.struffelproductions.com/file/CC0-Textures/download/' + name + "_" + raw_id + "/" + name + "_" + form + "." + ext;
        // https://acg-download.struffelproductions.com/file/ambientCG-Web/download/Bricks092_gp3i5UJf/Bricks092_1K-JPG.zip
        let link = 'https://acg-download.struffelproductions.com/file/ambientCG-Web/download/' + name + "_" + raw_id + "/" + name + "_" + form + "." + ext;
        return link;
    }

    findMaterials(searchString) {
        if(!this.materials) return [];
        searchString = searchString && searchString.toLowerCase()
        return this.materials
            .filter(value => {
                return !searchString || value[0].toLowerCase().includes(searchString)
            })
            .map(value => ({name: value[0], id: value[1], res: value[2]}))
            .sort((a, b) => !searchString || (a.name.toLowerCase().indexOf(searchString) - b.name.toLowerCase().indexOf(searchString))); // sort by index of substring.
    }

    static async getMaterialMaps(url) {
        let alpha = !url.toLowerCase().includes('jpg');
        let i_ext = alpha ? "png" : "jpg";

        let link = url; // this.resolveMaterialLink(name, i_ext);
        if (typeof link !== "string") return null;

        let blobs = await CC0TexturesHelper.getBlobsFromLink(link, i_ext);

        let maps = {}
        for (const [name, blob] of Object.entries(blobs)) {
            let url = URL.createObjectURL(blob);
            let _name = name.replace("." + i_ext, '')
            let map = CC0TexturesHelper.getMapWithName(_name);
            if (map) maps[map] = url;
        }
        let textureLoader = new TextureLoader();
        for (const map of Object.keys(maps)) {
            let url = maps[map];
            maps[map] = textureLoader.load(url, texture => {
                URL.revokeObjectURL(url);
            });
        }
        return [maps, alpha];
        // return new MeshStandardMaterial({
        //     ...maps,
        //     roughness: 1,
        //     metalness: 1,
        //     color: "#ffffff",
        //     transparent: alpha,
        // });
    }

    static async getBlobsFromLink(link, i_ext) {
        const blob = await (await fetch(link)).blob();
        return CC0TexturesHelper.unzipBlobFFlate(blob, "image/" + i_ext)
    }

    static async unzipBlobFFlate(blob, mimeType) {
        const fflate = await import('fflate');
        let files = await blob.arrayBuffer().then(buff => fflate.unzipSync(new Uint8Array(buff)));
        let blobs = {};
        for (let [name, buff] of Object.entries(files)) {
            let blob = new Blob([buff], {type: mimeType});
            if (name) blobs[name] = blob;
        }
        return blobs;
    }

    static getMapWithName(name) {
        if (!name || typeof name !== 'string') return null;
        if (name.endsWith("_Normal")) return 'normalMap';
        if (name.endsWith("_NormalGL")) return 'normalMap';
        else if (name.endsWith("_Displacement")) return 'displacementMap';
        else if (name.endsWith("_AmbientOcclusion")) return 'aoMap';
        else if (name.endsWith("_Roughness")) return 'roughnessMap';
        else if (name.endsWith("_Metalness")) return 'metalnessMap';
        else if (name.endsWith("_Color")) return 'map';
        else {
            console.warn("unknown", name);
            return null;
        }
    }

    static getPreviewLink(name, variant = "128-JPG-FFFFFF") {
        return "https://acg-media.struffelproductions.com/file/ambientCG-Web/media/thumbnail/" + variant + "/" + name + ".jpg"
    }

}
