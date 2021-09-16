import * as THREE from 'three';
import { debounce } from 'lodash';

import NameSpace from '@/3d/lib/Common/nameSpace';
import { loadBlob } from '@/3d/lib/FileParser/loadArrayBuffer';
import { RCSFormat } from '@/3d/lib/FileParser/rcs/RCSFormat';

const fileReg = /^[C|D]:([\\|\/]?[a-zA-Z0-9\s_.-]+)+$/;
const numberStr = '([0-9.]+)';
const paramStr = `${numberStr}-${numberStr}-${numberStr}-${numberStr}`;
const paramReg = new RegExp(paramStr);
const url = 'http://222.18.149.104:8081/api/product/readZipProductFile?pos_file=';
// const file = 'D:/Program Files/Radar/PT/data/20210914/RCS/20210914_172343.00.009.001_24184-354.00-56192-6.00-0.00_R0.zip';
const _moveCallback = debounce(moveCallback, 400);

export function registerEmitter () {
    MeteoInstance.emitter.on(NameSpace.REALDATAADDRESS, (posFile) => {
        let result = posFile.match(fileReg);
      
        let dotSplit = result ? result[1].split('.') : [];
        if (dotSplit.length > 0) {
            let type = dotSplit[2];
            switch (+type) {
                case 9:
                    _moveCallback(result[1], posFile);
                    // moveCallback(result[1], posFile);
                    break;
                case 52:
                    break;
                default:
                    break;
            }
        }
    });
    
    MeteoInstance.emitter.on('moveNsPlane', (obj) => {
        MeteoInstance.socket._sendOnTimeProductToPT(obj, '886');
        // MeteoInstance.socket.sendOnTimeProductToPT(obj, '886');
    });

    MeteoInstance.emitter.on('moveWsPlane', (obj) => {
        MeteoInstance.socket._sendOnTimeProductToPT(obj, '886');
        // MeteoInstance.socket.sendOnTimeProductToPT(obj, '886');
    });
}


function moveCallback(str, posFile) {
    let result = str.match(paramReg);
    let start = Date.now();
    loadBlob(url + window.encodeURIComponent(posFile), 'arraybuffer').then(data => {
        RCSFormat.Load(data).then((rcs) => {
            const canvas = rcs.toImageCanvas2(null, null, MeteoInstance.colorArray);
            if (canvas) {
                let degree = (+result[2]) + (+result[4]);
                console.log('rcs ===>', degree);
                let type = '';
                if (degree === 180) {
                    type = 'moveNs';
                } else if (degree === 360) {
                    type = 'moveWe';
                }
                let object = MeteoInstance.three.scene.getObjectByName(type);
                object.material.map = new THREE.CanvasTexture( canvas );
                object.material.map.needsUpdate = true;
                console.log('internet speed time ==>', Date.now() - start);
            }
        })
    });
}
