const amqp = require('amqplib');

class RabbitMQConnection {
  constructor() {
    if (RabbitMQConnection.instance) {
      return RabbitMQConnection.instance;
    }

    this.connection = null;
    RabbitMQConnection.instance = this;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
      console.log('RabbitMQ connection successful');
    }

    return this.connection;
  }
}

module.exports = new RabbitMQConnection();
