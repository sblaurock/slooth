/*
  Slooth
*/

(function($) {
  var _options = {
    checkUnsupported: true,
    key: 'aore8874ym0a4i',
    supported: [
      'Chrome',
      'Firefox'
    ],
    data: {
      chunkSize: 51200
    }
  };

  // Holds references to DOM elements this script accesses.
  var _elements = {
    input: $('#input')
  };

  // Messages shown to the user.
  var _messages = {
    unsupportedBrowser: 'This app is only currently supported in Chrome and Firefox',
    unsupportedFiletype: 'This app only supports audio files.'
  };

  var _tools = {
    // Returns a boolean indicating the users browser support.
    isSupported: function() {
      return $.inArray(util.browser, _options.supported) !== -1 && window.File && window.FileReader && window.FileList && window.Blob && window.AudioContext;
    }
  };

  // Proceed no further if the user is not using an unsupported browser.
  if(_options.checkUnsupported && !_tools.isSupported()) {
    console.error(_messages.unsupportedBrowser);

    return;
  }

  var session = {
    id: '',
    reference: null,

    // Create a Peer session.
    create: function(callback) {
      var self = this;

      var peer = new Peer({
        key: _options.key
      });

      peer.on('open', function(id) {
        self.id = id;
        self.reference = peer;

        if(typeof callback === 'function') {
          callback(peer);
        }
      });
    },

    // Fire when a connection is established.
    open: function(connection, callback) {
      connection.on('open', function() {
        if(typeof callback === 'function') {
          callback();
        }
      });
    }
  };

  // Defines host functionality.
  var host = function() {
    subscribers = [];

    return {
      // Listen for subscriber connections.
      listen: function(callback) {
        session.reference.on('connection', function(subscriber) {
          subscribers.push(subscriber);

          session.open(subscriber, callback);
        });
      },

      // Transmit data to subscribers.
      send: function(data) {
        subscribers.forEach(function(subscriber) {
          subscriber.send(data);
        });
      }
    };
  }();

  // Defines subscriber functionality.
  var subscriber = function() {
    var host = null;

    return {
      // Connect to a host.
      connect: function(id, callback) {
        host = session.reference.connect(id);

        session.open(host, callback);
      },

      // Listen for data from host.
      listen: function(callback){
        host.on('data', function(data) {
          if(typeof callback === 'function') {
            callback(data);
          }
        });
      }
    };
  }();

  // Defines data manipulation functionality.
  var data = function() {
    var chunksLoaded = 0;
    var buffer = null;

    return {
      // Split buffer into chunks to be sent to subscriber.
      split: function(buffer) {
        var chunks = [];
        var length = buffer.byteLength;
        var current = 0;
        var end = 0;

        while(current < length) {
          end = current + _options.data.chunkSize;

          if(end > length) {
            end = length;
          }

          chunks.push(buffer.slice(current, end));

          current = end;
        }

        return chunks;
      },

      // Append chunks into buffer to be decoded by subscriber.
      append: function(chunk) {
        if(!chunksLoaded) {
          buffer = chunk;
        } else {
          var temp = new Uint8Array(buffer.byteLength + chunk.byteLength);

          temp.set(new Uint8Array(buffer), 0);
          temp.set(new Uint8Array(chunk), buffer.byteLength);

          buffer = temp.buffer;
        }

        chunksLoaded++;
      },

      // Return current buffer.
      getBuffer: function() {
        return buffer;
      }
    };
  }();

  // Defines functionality around audio playback.
  var audio = function() {
    var buffer = null;
    var position = 0;
    var context = new AudioContext();
    var source = null;

    return {
      // Decode aggregated data buffer and set new audio buffer.
      set: function(callback) {
        context.decodeAudioData(data.getBuffer(), function(decoded) {
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
      }
    };
  }();

  session.create(function(peer) {
    console.log(peer.id);

    if(window.location.hash) {
      var id = window.location.hash.replace('#', '');
      var chunksReceived = 0;

      _elements.input.hide();

      subscriber.connect(id, function() {
        subscriber.listen(function(chunk) {
          data.append(chunk);
          audio.set(function() {
            audio.play();
          });
        });
      });
    } else {
      host.listen(function() {
        console.log('A user has subscribed.');
      });
    }
  });

  $(document).ready(function() {
    _elements.input.on('change', function(e) {
      var file = $(this).get(0).files[0];

      if(!file || !file.type.match(/audio[.]*/)) {
        console.error(_messages.unsupportedFiletype);

        return;
      }

      var reader = new FileReader();

      reader.onload = (function(e) {
        var chunks = data.split(e.target.result);

        chunks.forEach(function(chunk) {
          host.send(chunk);
        });
      });

      reader.readAsArrayBuffer(file);
    });
  });
}(jQuery));