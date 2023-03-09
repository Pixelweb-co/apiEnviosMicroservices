const amqp = require('amqplib');
const redis = require('redis');



class RedisConnection {
  constructor() {
    if (RedisConnection.instance) {
      return RedisConnection.instance;
    }

    this.connection = null;
    RedisConnection.instance = this;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await redis.createClient({ host: 'redis' });
      console.log('Redis connection successful');
    }

    return this.connection;
  }


async storeUser(userName, socketId) {
  // Verificamos si el usuario ya existe en la lista
  this.connection.lrange('users', 0, -1, (err, usuarios) => {
    if (err) {
      console.error(err);
    } else {
      const usuarioExistente = usuarios.find(usuario => {
        const [existingUserName, existingSocketId] = usuario.split(':');
        return existingUserName === userName && existingSocketId !== socketId;
      });

      if (usuarioExistente) {
        const [existingUserName, existingSocketId] = usuarioExistente.split(':');
        console.log(`El usuario ${existingUserName} ya existe en la lista con el socketId ${existingSocketId}. Actualizando el socketId a ${socketId}.`);

        // Actualizamos el socketId del usuario existente
        this.connection.lrem('users', 0, usuarioExistente, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            this.connection.rpush('users', `${userName}:${socketId}`, (err, result) => {
              if (err) {
                console.error(err);
              } else {
                console.log(`El usuario ${userName} ha sido actualizado en la lista con el socketId ${socketId}.`);
              }
            });
          }
        });
      } else {
        console.log(`El usuario ${userName} no existe en la lista. Agregando el usuario con el socketId ${socketId}.`);

        // Agregamos el usuario a la lista
        this.connection.rpush('users', `${userName}:${socketId}`, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`El usuario ${userName} ha sido agregado a la lista con el socketId ${socketId}.`);
          }
        });
      }
    }
  });
}



  async readUser(username) {
    this.connection.hgetall(`users:${username}`, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    });
  }

  async deleteUser(username) {
    this.connection.del(`users:${username}`, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`User ${username} deleted successfully`);
      }
    });
  }
  

}

module.exports = new RabbitMQConnection();
