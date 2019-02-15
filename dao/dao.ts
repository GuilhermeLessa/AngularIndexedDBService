export abstract class DAO {

    abstract STORE;
    private readonly AUTO_INCREMENT = null;

    constructor(private readonly connection) { }

    private openTransactionStore() {
        if (this.connection.withTransaction) {
            return this.connection.objectStore(this.STORE.name);
        }

        return this.connection
            .transaction([this.STORE.name], 'readwrite')
            .objectStore(this.STORE.name);
    }

    insert(object) {
        return new Promise((resolve, reject) => {
            let request = this.openTransactionStore().add(object);

            request.onsuccess = event => {
                console.log('insert success');
                console.log(event);
                object[this.STORE.options.keyPath] = event.target.result;
                resolve(object);
            }

            request.onerror = event => {
                console.log('insert error');
                console.log(event);
                reject(event.target.error);
            }
        });
    }

    select(key) {
        return new Promise((resolve, reject) => {
            let request = this.openTransactionStore().get(key);

            request.onsuccess = event => {
                console.log('select success');
                console.log(event);
                if (event.target.result)
                    resolve(event.target.result);
                else
                    reject(new Error(`KeyPath ${this.STORE.name}.${this.STORE.options.keyPath} = ${key} not found`));
            }

            request.onerror = event => {
                console.log('select error');
                console.log(event);
                reject(event.target.error);
            }
        });
    }

    /**
     * if object dont exists, create new
     * @param object 
     */
    save(object) {
        return new Promise((resolve, reject) => {
            let key = object[this.STORE.options.keyPath];
            if (!key) {
                if (this.STORE.options.autoIncrement) //if new object, can use auto increment
                    delete object[this.STORE.options.keyPath]; //if auto increment, remove invalid key
                else
                    reject(new Error(`Invalid KeyPath ${this.STORE.name}.${this.STORE.options.keyPath} and autoIncrement disabled`));
            }

            let request = this.openTransactionStore().put(object);

            request.onsuccess = event => {
                if (!key) //if new object register
                    object[this.STORE.options.keyPath] = event.target.result; //retorna new generated key

                console.log('save success');
                console.log(event);
                console.log(object);
                resolve(object);
            }

            request.onerror = event => {
                console.log('save error');
                console.log(event);
                reject(event.target.error);
            }
        });
    }

    saveByKey(key, value) {
        let object = {};
        object[this.STORE.options.keyPath] = key;
        object[key] = value;
        return this.save(object);
    }

    /**
     * just object exists, dont create new
     * @param object 
     */
    update(object) {
        return new Promise((resolve, reject) => {
            let key = object[this.STORE.options.keyPath];
            if (!key)
                reject(new Error(`Invalid KeyPath ${this.STORE.name}.${this.STORE.options.keyPath}`));

            let request = this.openTransactionStore();
            let get = request.get(key);

            get.onsuccess = event => {
                let oldObject = event.target.result;
                object = Object.assign(oldObject, object); //update data

                var update = request.put(object);

                update.onsuccess = event => {
                    console.log('update success');
                    console.log(event);
                    console.log(object);
                    resolve(object);
                }

                update.onerror = event => {
                    console.log('update error');
                    console.log(event);
                    reject(event.target.error);
                }
            }

            get.onerror = event => {
                console.log('update get error');
                console.log(event);
                reject(event.target.error);
            }
        });
    }

    delete(key) {
        return new Promise((resolve, reject) => {
            let request = this.openTransactionStore().delete(key);

            request.onsuccess = event => {
                console.log('delete success');
                console.log(event);
                console.log(key);
                resolve(key);
            }

            request.onerror = event => {
                console.log('delete error');
                console.log(event);
                reject(event.target.error);
            }
        });
    }

    selectAll() {
        return new Promise((resolve, reject) => {
            let request = this.openTransactionStore().openCursor();

            let objects = [];

            request.onsuccess = event => {
                let object = event.target.result;
                if (object) {
                    objects.push(object.value);
                    object.continue();
                } else {
                    console.log('select all success');
                    console.log(event);
                    console.log(objects);
                    resolve(objects);
                }
            };

            request.onerror = event => {
                console.log('select all error');
                console.log(event);
                reject(event.target.error);
            }
        });
    }

    selectAllByKey() {
        return new Promise((resolve, reject) => {
            this.selectAll().then((objects: any) => {
                let map = new Object();
                for (let i = 0; i < objects.length; i++) {
                    let key = objects[i][this.STORE.options.keyPath];
                    map[key] = objects[i][key];
                }
                resolve(map);
            }, reject);
        });
    }

}