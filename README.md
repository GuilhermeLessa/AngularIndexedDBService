# AngularIndexedDBService
A Angular service to storage data on browser with IndexedDB, using DAO pattern. 
The community development is apreciate, please help-me to improve it.


Examples:

```typescript

import { Component, OnInit } from '@angular/core';
import { MyDatabaseService } from '../core/indexedDb/myDatabase.service';
import { ClientsDAO } from '../core/dao/clientsDao';
import { ProductsDAO } from '../core/dao/producstDao';

@Component({
    templateUrl: 'clients.component.html'
})
export class ClientsComponent implements OnInit {

    clientId; //load id from route is a good way

    constructor(private dataBase: MyDatabaseService) { }

    simpleInsert() {
        this.dataBase.getConnection()
            .then(connection => new ClientsDAO(connection))
            .then(clientsDAO => {
                const client = {
                    name: 'Microsoft Company',
                    address: 'California'
                };

                clientsDAO.insert(client).then(client => {
                    //on success return new client insert
                });
            });
    }
    
    selectAllClients() {
        this.dataBase.getConnection()
            .then(connection => new ClientsDAO(connection))
            .then(clientsDAO => {
                clientsDAO.selectAll().then(all => {
                    //foreach all
                });
            });
    }

    delete() {
        this.dataBase.getConnection()
            .then(connection => new ClientsDAO(connection))
            .then(clientsDAO => {
                const clientKey = 3;
                clientsDAO.delete(clientKey).then(client => {
                    //delete client.id = 3
                });
            });
    }


    insertAndUpdateUsingSameForm() {
        this.dataBase.getConnection()
            .then(connection => new ClientsDAO(connection))
            .then(clientsDAO => {

                //use same form to insert new and update client
                //if clientId exists save method update data, else insert new then use auto increment
                const client = {
                    id: (this.clientId ? this.clientId : clientsDAO.AUTO_INCREMENT),
                    name: 'Microsoft Company',
                    address: 'California'
                };

                clientsDAO.save(client).then(client => {
                    //on success return object client saved
                });
            });
    }

    //kepp all data usign unique transactions
    saveAllOrNothing() {
        this.dataBase.getConnectionWithTransaction(['clients', 'products'])
            .then(transaction => {
                let clientsDAO = new ClientsDAO(transaction);
                let productsDAO = new ProductsDAO(transaction);

                Promise.all([
                    clientsDAO.insert({ name: 'new client', address: 'brazil' }),
                    clientsDAO.insert({ name: 'new client', address: 'japan' }),
                    productsDAO.save({ id: 10, name: 'update product 10', price: 22.50 })
                ])
                    .then(success => {
                        //if you want cancel all operations
                        transaction.abort();
                    })
                    .catch(error => {
                        //indexedDb onerror then abort is auto call, do not need use transaction.abort()
                    });
            });
    }

}

```
