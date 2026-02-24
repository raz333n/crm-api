const mongoose = require('mongoose');

const configureDB = async () => {
    try{    
        await mongoose.connect(process.env.DB_URL)
        console.log('connected to db');
    } catch(err){
        console.log('error connecting to db', err)
    }
}

module.exports = configureDB;