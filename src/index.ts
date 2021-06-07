import {searchableGrid} from "./searchableGrid";
import {
    AmbientLight, LoadingManager,
    Mesh, MeshPhysicalMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PMREMGenerator,
    Scene,
    UnsignedByteType,
    WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {CC0MaterialLoader} from "./cc0_threejs_loader";
import {Material} from "three/src/materials/Material";
// @ts-ignore
import materials_data from "./data/materials.Popular.0.txt";
const helperText = document.getElementById("helperText") as HTMLDivElement;
const container = document.getElementById("canvasContainer");
document.body.appendChild( container );

const renderer = new WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const scene = new Scene();

const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera( 45, aspect, 500, 3000 );
camera.position.z = 1500;
scene.add( camera );

const controlsPerspective = new OrbitControls( camera, renderer.domElement );
// controlsPerspective.minDistance = 1000;
// controlsPerspective.maxDistance = 2400;
controlsPerspective.enablePan = true;
controlsPerspective.enableDamping = true;
controlsPerspective.screenSpacePanning = true;

const pmremGenerator = new PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

let cc0Loader = new CC0MaterialLoader(new LoadingManager(), materials_data);
new RGBELoader().load("https://dl.polyhaven.com/file/ph-assets/HDRIs/hdr/1k/photo_studio_01_1k.hdr", dataTexture => {

    let tex  = pmremGenerator.fromEquirectangular( dataTexture );

    scene.environment = tex.texture;
    // scene.background = tex.texture;
    pmremGenerator.dispose();

});


// lights
const ambientLight = new AmbientLight( 0xffffff, 0.1 );
scene.add( ambientLight );


const SCALE = 2.436143; // from original model
const BIAS = - 0.428408; // from original model

let mesh: Mesh| undefined;
init();
animate();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    const loader = new OBJLoader();
    loader.load( "ninjaHead_Low.obj", function ( group ) {

        mesh = group.children[0] as Mesh;

        const geometry = mesh.geometry;
        geometry.attributes.uv2 = geometry.attributes.uv;
        geometry.center();

        mesh.scale.multiplyScalar( 25 );
        scene.add( mesh );

    } );
    //
    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = window.innerWidth / window.innerHeight;

    camera.aspect = aspect;

    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}

//

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    renderer.render( scene, camera );
}

function createMaterialLink(name: string){
    return `<a style="color: #444444" target="_blank" rel="noopener" href='https://cc0textures.com/view?id=${name}'>${name}</a>`;
}

function onMaterialSelect(name: string){
    cc0Loader.findAndLoad(name, true, (params: any)=>{
        if(!params) return;
        if(mesh.material){
            let textures = (mesh.material as Material).userData.textures;
            textures?.forEach((t: any)=>t?.dispose());
            (mesh.material as Material).dispose();
        }
        mesh.material = new MeshPhysicalMaterial(params);
        mesh.material.userData.textures = Array.from(Object.values(params).filter((v:any)=>v.isTexture));
        helperText.innerHTML = "Material Loaded: " + createMaterialLink(name);
    });
}
searchableGrid(
    document.getElementById("inputText") as HTMLInputElement,
    document.getElementById("gridContainer") as HTMLDivElement,
    (text, type) => {
        let materials = [];
        if(type === 'tag'){
            let s = new Set();
            materials =  cc0Loader
                .findMaterials(text)
                .map(value => ({label: value.name.replace(/[0-9]/g, "")}))
                .filter(value => {
                        if(s.has(value.label)) return false;
                        s.add(value.label); return true;
                })
                // .slice(0, 20);
                ;
        }else {
            materials = cc0Loader
                .findMaterials(text)
                .slice(0, 100)
                .map(value => ({label: value.name, img: cc0Loader.getPreviewLink(value.name)}));
        }
        return materials;
    },
    item => {
        const itemElement = document.createElement("div");
        const imgElement = document.createElement("img") as HTMLImageElement;
        itemElement.classList.add("gridItem");
        imgElement.src = item.img;
        imgElement.alt = item.label;
        imgElement.style.width = "100%"
        imgElement.style.height = "100%"
        imgElement.onclick = ev => {
            helperText.innerHTML = "Loading Material: " + createMaterialLink(item.label);
            onMaterialSelect(item.label);
        }
        itemElement.appendChild(imgElement);
        return itemElement;
    }
)
