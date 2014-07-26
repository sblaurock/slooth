// Defines functionality around audio playback.
define(['data'], function(Data) {
  var buffer = null;
  var position = 0;
  var context = new AudioContext();
  var source = null;

  return {
    // Decode aggregated data buffer and set new audio buffer.
    set: function(callback) {
      context.decodeAudioData(Data.getBuffer(), function(decoded) {
        buffer = decoded;

        if(typeof callback === 'function') {
          callback();
        }
      });
    },

    // Play audio buffer and syncronize time (thanks to: http://goo.gl/uY0tDF).
    play: function() {
      var scheduledTime = 0.015;
      var currentTime = 0;

      try {
        source.stop(scheduledTime);
      } catch (e) {}

      source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      currentTime = context.currentTime + 0.010 || 0;
      source.start(scheduledTime - 0.005, currentTime, buffer.duration - currentTime);
    },

    // Return relevant ID3 tags from file.
    decode: function(file, callback) {
      ID3.loadTags('*', function() {
          var data = ID3.getAllTags('*');
          var tags = {
            'artist': data.artist,
            'title': data.title,
            'genre': data.genre,
            'year': data.year,
            'artwork': data.picture
          };

          if(tags.artwork) {
            var base64String = '';

            for (var i = 0, length = tags.artwork.data.length; i < length; i++) {
              base64String += String.fromCharCode(tags.artwork.data[i]);
            }

            tags.artwork = 'data:' + tags.artwork.format + ';base64,' + window.btoa(base64String);
          }

          if(typeof callback === 'function') {
            callback(tags);
          }
      }, {
          dataReader: FileAPIReader(file),
          tags: ['artist', 'title', 'genre', 'year', 'picture']
      });
    }
  };
});