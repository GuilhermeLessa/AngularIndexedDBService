import { DAO } from './DAO';

export class ProductsDAO extends DAO {

    STORE = {
        name: 'products',
        options: {
            keyPath: 'id',
            autoIncrement: true,
            unique: true
        }
    };

}