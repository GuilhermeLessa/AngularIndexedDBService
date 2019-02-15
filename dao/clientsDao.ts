import { DAO } from './DAO';

export class ClientsDAO extends DAO {

    STORE = {
        name: 'clients',
        options: {
            keyPath: 'id',
            autoIncrement: true,
            unique: true
        }
    };

}