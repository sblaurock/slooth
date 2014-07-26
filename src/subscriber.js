// Defines subscriber functionality.
define(['session'], function(Session) {
  var host = null;

  return {
    // Connect to a host.
    connect: function(id, callback) {
      host = Session.get().connect(id);

      Session.open(host, callback);
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
});