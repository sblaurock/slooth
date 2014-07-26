// Defines host functionality.
define(['session'], function(Session) {
  subscribers = [];

  return {
    // Listen for subscriber connections.
    listen: function(callback) {
      Session.get().on('connection', function(subscriber) {
        subscribers.push(subscriber);

        Session.open(subscriber, callback);
      });
    },

    // Transmit data to subscribers.
    send: function(data) {
      subscribers.forEach(function(subscriber) {
        subscriber.send(data);
      });
    }
  };
});