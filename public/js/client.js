(function($) {
  var options = {
    checkUnsupported: true,
    supported: [
      'Chrome',
      'Firefox'
    ],
    pollTime: 500
  };

  // Holds references to DOM elements this script accesses.
  var elements = {
    input: $('#input')
  };

  // Messages shown to the user.
  var messages = {
    unsupportedBrowser: 'This app is only currently supported in Chrome and Firefox',
    unsupportedFiletype: 'This app only supports audio files.',
    missingDependencies: 'The dependency library code could not be loaded.'
  };

  var tools = {
    // Returns a boolean indicating the users browser support.
    isSupported: function() {
      return $.inArray(util.browser, options.supported) !== -1 && window.File && window.FileReader && window.FileList && window.Blob && window.AudioContext;
    }
  };

  // Proceed no further if the user is not using an unsupported browser.
  if(options.checkUnsupported && !tools.isSupported()) {
    console.error(messages.unsupportedBrowser);
    return;
  }

  // Poll until we have access to our library code (yuk).
  if(window.Slooth) {
    initialize(window.Slooth);
  } else {
    var start = Date.now();
    var poll = setInterval(function() {
      if(window.Slooth) {
        clearInterval(poll);
        initialize(window.Slooth);
      } else {
        if(Date.now() - start > options.pollTime) {
          clearInterval(poll);
          console.error(messages.missingDependencies);
        }
      }
    }, 0);
  }

  var initialize = function(Slooth) {
    // Register global library aliases.
    var Audio = Slooth.Audio;
    var Data = Slooth.Data;
    var Host = Slooth.Host;
    var Session = Slooth.Session;
    var Subscriber = Slooth.Subscriber;

    Session.create(function(peer) {
      console.log(peer.id);

      if(window.location.hash) {
        var id = window.location.hash.replace('#', '');

        elements.input.hide();

        Subscriber.connect(id, function() {
          Subscriber.listen(function(chunk) {
            Audio.play(Data.append(chunk));
          });
        });
      } else {
        Host.listen(function() {
          console.log('A user has subscribed.');
        });
      }
    });

    $(document).ready(function() {
      elements.input.on('change', function(e) {
        var file = $(this).get(0).files[0];

        if(!file || !file.type.match(/audio[.]*/)) {
          console.error(messages.unsupportedFiletype);
          return;
        }

        var reader = new FileReader();

        reader.onload = (function(e) {
          var chunks = Data.split(e.target.result);

          Audio.decode(e.target.result, function(decoded) {
            Host.schedule(decoded, chunks);
          });
        });

        reader.readAsArrayBuffer(file);
        Audio.tags(file, function(tags) {
          console.log(tags);
        });
      });
    });
  };
}(jQuery));