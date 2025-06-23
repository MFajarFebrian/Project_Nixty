import mysql from 'mysql2/promise';
import { useOnlineDB } from './config.js';


const dbConfigs = {
  local: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nixty',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  online: {
    host: 'sql12.freesqldatabase.com',
    user: 'sql12782583',
    password: 'vR3ku4pQn2',
    database: 'sql12782583',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};

const config = useOnlineDB ? dbConfigs.online : dbConfigs.local;
console.log(`Using ${useOnlineDB ? 'ONLINE' : 'LOCAL'} database`);

const pool = mysql.createPool(config);

export default pool; 