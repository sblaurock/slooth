// Defines host functionality.
define(['audio', 'session'], function(Audio, Session) {
  subscribers = [];
  preloadChunks = 3;
  buffer = 50;

  return {
    // Listen for subscriber connections.
    listen: function(callback) {
      Session.get().on('connection', function(subscriber) {
        subscribers.push(subscriber);

        Session.open(subscriber, callback);
      });
    },

    // Stream chunks to subscribers while trimming expired data.
    schedule: function(decoded, chunks) {
      var chunkDuration = decoded.duration / chunks.length;
      var sent = 0;
      var self = this;

      var poll = setInterval(function() {
        if(Audio.time() > (sent - buffer) * chunkDuration) {
          for(var i = 0; i < preloadChunks; i++) {
            self.send(chunks[sent + i]);
          }

          sent += preloadChunks;
        }
      }, 50);
    },

    // Transmit data to subscribers.
    send: function(data) {
      subscribers.forEach(function(subscriber) {
        subscriber.send(data);
      });
    }
  };
});