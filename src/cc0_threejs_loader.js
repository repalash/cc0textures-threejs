import {Loader} from "three";
import {CC0TexturesHelper} from "./cc0textures_helper";

export class CC0MaterialLoader extends Loader {

    constructor(manager, materials_data = undefined) {
        super(manager);
        this.helper = new CC0TexturesHelper(materials_data);
    }

    getPreviewLink(name, variant = "128-JPG-FFFFFF") {
        return CC0TexturesHelper.getPreviewLink(name, variant);
    }

    findMaterials(searchString) {
        return this.helper.findMaterials(searchString);
    }

    /**
     * Materials data must be set in the constructor for this to work.
     * @param searchString - substring to find in the name.
     * @param alpha
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    findAndLoad(
        searchString,
        alpha,
        onLoad,
        onProgress = ()=>{},
        onError = ()=>{},
    ) {
        let materials = this.findMaterials(searchString);
        if (materials.length < 1) {
            onError(new Error("No such material exists"));
            return
        }
        let material = materials[0];
        let link = this.helper.resolveMaterialLink(material.name, alpha);
        return this.load(link, onLoad, onProgress, onError);
    }

    /**
     *
     * @param url - to the zip file. sample - https://cdn3.struffelproductions.com/file/CC0-Textures/download/Ground019_01fsyirl/Ground019_1K-PNG.zip
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load(
        url,
        onLoad,
        onProgress,
        onError,
    ) {
        CC0TexturesHelper.getMaterialMaps(url).then(([maps, alpha]) => {
            onLoad({
                ...maps,
                roughness: 1,
                metalness: 1,
                color: "#ffffff",
                transparent: alpha,
            })
        });
    }

}
