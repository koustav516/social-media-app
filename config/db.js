const mongoose = require('mongoose');

const mongoUrl = 'mongodb://localhost/twitter';

class Database {
    constructor() {
        this.dbConnection();
    }
    dbConnection() {
        mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        });
        
        const connection = mongoose.connection;
        connection.once('open', ()=>{
            console.log('Database connected');
        }).catch(err =>{
            console.log('Connection Failed: ', err);
        });
    }
}

module.exports = new Database();