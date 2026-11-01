document.addEventListener('DOMContentLoaded', () => {
if (window.app && window.app.destroy) {
    window.app.destroy(true, { children: true, texture: true, baseTexture: true });
}

let canvas = document.getElementById('anim');

if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'anim';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '1';
    canvas.style.zIndex = '-1';
    document.body.insertBefore(canvas, document.body.firstChild);
}

const app = new PIXI.Application({
    view: canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: window
});

window.app = app; // global scope

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // sharp pixelart

const loader = new PIXI.Loader();
loader.add("medusa", "/assets/medumd.json");
loader.load(handleLoadComplete);

let medusaCluster = [];

function handleLoadComplete(loader, resources) {
    let sheetMedusa = resources.medusa.spritesheet;
    let framesMedusa = sheetMedusa.animations["swim"];

    let clusterX = Math.random() * app.renderer.screen.width;
    let clusterY = app.renderer.screen.height + 100;

    for (let i = 0; i < 3; i++) {
        let medusa = new PIXI.AnimatedSprite(framesMedusa);
        medusa.anchor.set(0.5);

        medusa.animationSpeed = 0.2 + Math.random() * 0.04;
        medusa.loop = false;

        medusa.state = {
            startX: 0,
            targetX: 0,
            startY: 0,
            targetY: 0,
            offsetX: (Math.random() - 0.5) * 300,
            offsetY: (Math.random() - 0.5) * 300,
            isMoving: false,
            moveProgress: 0,
            moveDuration: 1.4 + Math.random() * 0.5,
            pauseDuration: 3000 + Math.random() * 2000,
            hasExited: false,

            idlePhase: Math.random() * Math.PI * 2, // startup timeout desyncronization
            idleSpeed: 0.001 + Math.random() * 0.001,
            idleAmplitude: 0.1 + Math.random() * 0.1
        };

        medusa.x = clusterX + medusa.state.offsetX;
        medusa.y = clusterY + medusa.state.offsetY;

        medusa.onFrameChange = function (currentFrame) {
            if (currentFrame === 5) {
                medusa.stop();

                // start position
                medusa.state.startY = medusa.y;
                medusa.state.startX = medusa.x;

                // end position
                medusa.state.targetY = medusa.y - (80 + Math.random() * 40);

                // horizontal displacement amount
                const driftX = (Math.random() - 0.5) * 50;
                medusa.state.targetX = medusa.x + driftX;

                medusa.state.isMoving = true;
                medusa.state.moveProgress = 0;
            }
        };

        medusa.onComplete = function () {
            medusa.gotoAndStop(0);

            setTimeout(() => {
                if (!medusa.state.hasExited) {
                    medusa.gotoAndPlay(0);
                }
            }, medusa.state.pauseDuration);
        };

        app.stage.addChild(medusa);
        medusaCluster.push(medusa);

        setTimeout(() => {
            medusa.gotoAndPlay(0);
        }, Math.random() * 2000);
    }

    // loop
    // ====
    app.ticker.add((delta) => {
        let exitedCount = 0;

        medusaCluster.forEach((medusa) => {
            let st = medusa.state;

            // 1. MOVIMIENTO DE IMPULSO (Vertical + Lateral)
            if (st.isMoving) {
                st.moveProgress += (delta / 60) / st.moveDuration;

                if (st.moveProgress >= 1) {
                    st.moveProgress = 1;
                    st.isMoving = false;
                    medusa.play();
                }

                const easeOut = 1 - Math.pow(1 - st.moveProgress, 3);

                // Posicionamiento en Y e X sincronizado con la curva de atenuación
                medusa.y = st.startY + (st.targetY - st.startY) * easeOut;
                medusa.x = st.startX + (st.targetX - st.startX) * easeOut;
            }
            // 2. MOVIMIENTO IDLE (Flotado sutil arriba / abajo cuando no se impulsa)
            else if (!st.hasExited) {
                st.idlePhase += st.idleSpeed * delta * 16.6; // Escalado por delta
                medusa.y += Math.sin(st.idlePhase) * st.idleAmplitude;
            }

            // Comprobar si la medusa salió por la parte superior
            if (medusa.y < -medusa.height) {
                st.hasExited = true;
            }

            if (st.hasExited) {
                exitedCount++;
            }
        });

        // medusas exited, create more
        // ====
        if (exitedCount === medusaCluster.length) {
            let newClusterX = Math.random() * app.renderer.screen.width;
            let newClusterY = app.renderer.screen.height + 100;

            medusaCluster.forEach((medusa) => {
                medusa.state.offsetX = (Math.random() - 0.5) * 250;
                medusa.state.offsetY = (Math.random() - 0.5) * 250;

                medusa.x = newClusterX + medusa.state.offsetX;
                medusa.y = newClusterY + medusa.state.offsetY;

                medusa.state.hasExited = false;
                medusa.state.isMoving = false;

                setTimeout(() => {
                    medusa.gotoAndPlay(0);
                }, Math.random() * 1500);
            });
        }
    });
}
});
