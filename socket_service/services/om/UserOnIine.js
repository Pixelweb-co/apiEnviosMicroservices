const { Entity, Schema, Repository } = require( 'redis-om')
const client = require( './Client')

/* our entity */
class User extends Entity {}

/* create a Schema for Person */
const userSchema = new Schema(User, {
  id: { type: 'string' },
  userName: { type: 'string' },
  nombres: { type: 'string' },
  //push_id: { type: 'trung' },
  location: { type: 'point' },
  locationUpdated: { type: 'date' },
  tipo: { type: 'string' },
  server_instance: { type: 'string' }
})


/* use the client to create a Repository just for Persons */
const userOnlineRepository = new Repository(userSchema,client)

/* create the index for Person */
async () => await userOnlineRepository.createIndex()

module.exports = client;