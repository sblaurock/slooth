// Defines functionality for interfacing with peer.js.
define(function() {
  var options = {
    key: 'aore8874ym0a4i',
  };

  var id = '';
  var reference = null;

  return {
    // Create a Peer session.
    create: function(callback) {
      var peer = new Peer({
        key: options.key
      });

      peer.on('open', function(id) {
        id = id;
        reference = peer;

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
    },

    // Return a reference to active Peer session.
    get: function() {
      return reference;
    }
  };
});