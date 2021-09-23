export class Object3D {
    constructor (mesh, minWGS84, maxWGS84, readonly) {
        this.threeMesh = mesh;
        this.minWGS84 = minWGS84;
        this.maxWGS84 = maxWGS84;
        this.readonly = readonly || false;
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

    updateWGS84 () {
        this.store.forEach(object => {
            object.minWGS84 = MeteoInstance.minWGS84;
            object.maxWGS84 = MeteoInstance.maxWGS84;
        });
    }

    cleanAll () {
        let obj;
        let readonlyArr = []
        while(obj = this.store.pop()) {
            
            if (!obj) {
                continue;
            }

            if (obj.readonly) {
                readonlyArr.push(obj);
                continue;
            }
            
            obj.threeMesh.clear();
            obj.threeMesh = null;
        }

        readonlyArr.forEach(obj => this.store.push(obj))
    }

    remove (name) {

    }
}