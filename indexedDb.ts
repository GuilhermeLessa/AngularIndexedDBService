export abstract class IndexedDB {

    private connection = null;
    private close = null;
    abstract STORES;

    getConnection(dbName, dbVersion, withTransaction = false, storesNames?) {
        return new Promise((resolve, reject) => {
            let openRequest = window.indexedDB.open(dbName, dbVersion);

            openRequest.onupgradeneeded = (event: any) =>
                this.createStores(event.target.result);

            openRequest.onsuccess = (event: any) => {
                if (this.connection) {
                    console.log('persistent connection success');
                    if (withTransaction) {
                        var connection = this.connection.transaction(storesNames, 'readwrite');
                        connection['withTransaction'] = true;
                        resolve(connection);
                    } else {
                        this.connection['withTransaction'] = false; //transaction controll remove
                        resolve(this.connection);
                    }
                } else {
                    this.connection = event.target.result;
                    this.close = this.connection.close.bind(this.connection);
                    this.connection.close = () => {
                        throw new Error('Você não pode fechar diretamente a conexão');
                    };
                    console.log('new connection success');
                    if (withTransaction) {
                        var connection = this.connection.transaction(storesNames, 'readwrite');
                        connection['withTransaction'] = true;
                        resolve(connection);
                    } else {
                        resolve(this.connection);
                    }
                }
            };

            openRequest.onerror = (event: any) => {
                console.log('connection error');
                console.log(event.target.error);
                reject(event.target.error);
            }
        });
    }

    closeConnection() {
        this.connection &&
            this.close();
        this.connection = null;
        this.close = null;
    }

    private createStores(connection) {
        this.STORES.forEach(store => {
            connection.objectStoreNames.contains(store.name) &&
                connection.deleteObjectStore(store.name);
            connection.createObjectStore(store.name, store.options);
        });
    }
}