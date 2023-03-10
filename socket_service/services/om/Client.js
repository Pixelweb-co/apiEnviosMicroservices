const { Client } = require('redis-om')
require('dotenv').config();
const { createClient } = require('redis');
/* pulls the Redis URL from .env */


const url = process.env.REDIS_SERVER

const redisC = createClient({ url: url })
redisC.on('error', (err) => console.log('Redis Client Error', err));

const aString = async()=>{
    
   const con = await redisC.connect()
   
    return redisC;
} // 'PONG'



/* create and open the Redis OM Client */
const client =  aString()

module.exports = client