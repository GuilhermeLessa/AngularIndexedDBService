import { Injectable } from '@angular/core';

import { IndexedDB } from './indexedDb';

const DB_NAME = 'my-database';

@Injectable({
    providedIn: 'root'
})
export class MyDatabaseService extends IndexedDB {

    STORES = [
        new ClientsDAO(null).STORE,
        new ProductsDAO(null).STORE
    ];

    getConnection() {
        return super.getConnection(DB_NAME, 1);
    }

    getConnectionWithTransaction(storesNames) {
        return super.getConnection(DB_NAME, 1, true, storesNames);
    }

}