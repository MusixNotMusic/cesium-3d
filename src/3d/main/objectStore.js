export class Object3D {
    constructor (mesh, minWGS84, maxWGS84) {
        this.threeMesh = mesh;
        this.minWGS84 = minWGS84;
        this.maxWGS84 = maxWGS84;
    }
}

export class ObjectStore {
    constructor () {
        this.store = MeteoInstance.objectStore;
    }

    push (obj) {
        if (obj instanceof Object3D) {
            this.store.push(obj);
        } else {
            throw TypeError('Object Type is not Object3D');
        }
    }

    pushBatch (objs) {
        objs.forEach(obj => {
            this.push(obj)
        })
    }

    cleanAll () {
        let obj;
        while(obj = this.store.pop()) {
            if (!obj) {
                continue;
            }
            obj.threeMesh.clear();
            obj.threeMesh = null;
        }
    }

    remove (name) {

    }
}