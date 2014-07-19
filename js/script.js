(function($) {
  $(document).ready(function() {
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

    var _tools = {
      // Returns a boolean indicating the users browser support.
      isSupported: function() {
        return $.inArray(util.browser, _options.supported) !== -1 && window.File && window.FileReader && window.FileList && window.Blob;
      }
    };

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

    if(_tools.isSupported()) {
      session.create(function(peer) {
        console.log(peer.id);

        if(window.location.hash) {
          var id = window.location.hash.replace('#', '');

          subscriber.connect(id, function() {
            subscriber.listen(function(data) {
              console.log('Data has been received from host.');
              console.log(data);
            });
          });
        } else {
          host.listen(function() {
            console.log('A user has subscribed.');

            host.send('Sample message.');
          });
        }
      });
    }

    
    // We don't need this just yet.
    /*if(_tools.isSupported()) {
      _elements.input.on('change', function(e) {
        var file = $(this).get(0).files[0];
        var reader = new FileReader();
        var blob = file.slice(0, file.size);

        reader.onload = (function() {
          console.log('File reader loaded.');
        }());
      });
    }*/
  });
}(jQuery));