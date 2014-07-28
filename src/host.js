// Defines host functionality.
define(['audio', 'session'], function(Audio, Session) {
  var subscribers = [];
  var chunksToSend = 1;
  var buffer = 1;
  var timeOffset = 0;

  return {
    // Listen for subscriber connections.
    listen: function(callback) {
      Session.get().on('connection', function(subscriber) {
        subscribers.push({
          reference: subscriber,
          sent: 0,
          start: null
        });

        Session.open(subscriber, callback);
      });
    },

    // Stream chunks to subscribers while trimming expired data.
    schedule: function(decoded, chunks) {
      var chunkDuration = decoded.duration / chunks.length;
      var time = 0;

      timeOffset = Audio.time();

      var poll = setInterval(function() {
        time = Audio.time();

        subscribers.forEach(function(subscriber) {
          if(subscriber.start === null) {
            subscriber.start = Math.floor((time - timeOffset) / chunkDuration);
          }

          if((time - timeOffset) > (subscriber.start + subscriber.sent - buffer) * chunkDuration) {
            for(var i = 0; i < chunksToSend; i++) {
              subscriber.reference.send(chunks[subscriber.start + subscriber.sent++]);
            }
          }
        });
      }, 0);
    }
  };
});