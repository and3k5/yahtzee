import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    TextureLoader,
    WebGLRenderer,
} from "three";
import one from "./face/1.svg?no-inline";
import two from "./face/2.svg?no-inline";
import three from "./face/3.svg?no-inline";
import four from "./face/4.svg?no-inline";
import five from "./face/5.svg?no-inline";
import six from "./face/6.svg?no-inline";
import type { AnimationTask } from "@/engine/graphics/animation";
import type { EventMap } from "@/engine/graphics/pointer-listener";

const deg = Math.PI / 2;
const rotationTable: [number, number, number][] = [
    [deg, 0, 0],
    [0, 0, 0],
    [deg, deg, deg],
    [0, deg, 0],
    [deg * 2, 0, 0],
    [0, deg * 3, deg * 1],
];

export function createDice() {
    const images = [
        // x positive
        three,
        // x negative
        four,
        // y positive
        one,
        // y negative
        six,
        // z positive
        two,
        // z negative
        five,
    ];

    const loader = new TextureLoader();

    const geometry = new BoxGeometry(0.5, 0.5, 0.5);

    const materials = images.map((x) => new MeshBasicMaterial({ map: loader.load(x) }));

    const mesh: Object3D<EventMap> & Mesh = new Mesh(geometry, materials);

    let animations: AnimationTask[] | null = null;

    let animation: AnimationTask | null = null;
    let renderer: WebGLRenderer | null = null;

    const dice = {
        init(a: AnimationTask[], r: WebGLRenderer) {
            animations = a;
            renderer = r;
        },
        mesh,
        hold: false,
        setValue(value: number) {
            this.value = value;

            const mtx = rotationTable[value - 1];

            const meshModif = animations ? mesh.clone() : mesh;
            meshModif.rotation.x = mtx[0];
            meshModif.rotation.y = mtx[1];
            meshModif.rotation.z = mtx[2];
            if (animations) {
                const anim: AnimationTask = {
                    run() {
                        const speed = 0.1;
                        const dx = meshModif.rotation.x - mesh.rotation.x;
                        const dy = meshModif.rotation.y - mesh.rotation.y;
                        const dz = meshModif.rotation.z - mesh.rotation.z;

                        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001 && Math.abs(dz) < 0.001) {
                            mesh.rotation.x = meshModif.rotation.x;
                            mesh.rotation.y = meshModif.rotation.y;
                            mesh.rotation.z = meshModif.rotation.z;
                            this.done = true;
                            return { done: true };
                        }

                        mesh.rotation.x += dx * speed;
                        mesh.rotation.y += dy * speed;
                        mesh.rotation.z += dz * speed;
                        return {
                            done: false,
                        };
                    },
                    done: false,
                };
                if (animation != null) {
                    animation.done = true;
                }
                animation = anim;
                animations.push(anim);
            }
        },
        value: 1,
    };

    mesh.addEventListener("click", () => {
        dice.hold = !dice.hold;
        renderMesh(mesh, dice.hold, false);
    });

    mesh.addEventListener("pointerover", () => {
        renderMesh(mesh, dice.hold, true);
        if (renderer) {
            renderer.domElement.style.cursor = "pointer";
        }
    });

    mesh.addEventListener("pointerout", () => {
        renderMesh(mesh, dice.hold, false);
        if (renderer) {
            renderer.domElement.style.cursor = "";
        }
    });

    return dice;
}

function renderMesh(mesh: Mesh, hold: boolean, hover: boolean) {
    if (hold) {
        mesh.scale.x = 1.2;
        mesh.scale.y = 1.2;
        mesh.scale.z = 1.2;
    } else if (hover) {
        mesh.scale.x = 1.1;
        mesh.scale.y = 1.1;
        mesh.scale.z = 1.1;
    } else {
        mesh.scale.x = 1;
        mesh.scale.y = 1;
        mesh.scale.z = 1;
    }
}
