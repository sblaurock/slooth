/*
  Slooth
*/

(function($) {
  var _options = {
    key: '4u478wggtkxzuxr',
    supported: [
      'Chrome',
      'Firefox'
    ],
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
  if(!_tools.isSupported()) {
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

  session.create(function(peer) {
    console.log(peer.id);

    if(window.location.hash) {
      var id = window.location.hash.replace('#', '');

      _elements.input.hide();

      subscriber.connect(id, function() {
        subscriber.listen(function(data) {
          if(typeof data === 'object') {
            var context = new AudioContext();

            context.decodeAudioData(data, function(buffer) {
              var source = context.createBufferSource();

              source.buffer = buffer;
              source.connect(context.destination);
              source.start(0);
            });
          }
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
        var buffer = e.target.result;

        host.send(buffer);
      });

      reader.readAsArrayBuffer(file);
    });
  });
}(jQuery));