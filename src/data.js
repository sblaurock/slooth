// Defines data manipulation functionality.
define(function() {
  var options = {
    chunkSize: 51200
  };

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
        end = current + options.chunkSize;

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

      return buffer;
    }
  };
});