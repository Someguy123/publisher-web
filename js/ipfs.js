(function() {
var ipfs = {};
ipfs.localProvider = {host: 'localhost', port: '5001', protocol: 'http'};

ipfs.setProvider = function(opts) {
  if (!opts) opts = this.localProvider;
  if (typeof opts === 'object' && !opts.hasOwnProperty('host')) {
    return;
  }
  ipfs.api = opts;
};

ipfs.api_url = function(path) {
  var api = ipfs.api;
  return api.protocol + "://" + api.host +
          (api.port ? ":" + api.port :"")  +
          (api.root ? api.root :"") + "/api/v0" + path;
}

function ensureProvider(callback) {
  if (!ipfs.api) {
    callback("No provider set", null);
    return false;
  }
  return true;
}

function request(opts) {
  if (!ensureProvider(opts.callback)) return ;
  var req = new XMLHttpRequest();
  req.addEventListener("load", function() {
    if (req.status != 200)
      opts.callback(req.responseText,null);
    else {
      var response = req.responseText;
      if (opts.transform) {
        response = opts.transform(response);
      }
      opts.callback(null,response);
    }
  });
  req.open(opts.method || "GET", ipfs.api_url(opts.uri));
  if (opts.accept) {
    req.setRequestHeader("accept", opts.accept);
  }
  if (opts.payload) {
    req.enctype = "multipart/form-data";
    console.log(opts);
    req.send(opts.payload);
  } else {
    req.send()
  }
}

ipfs.add = function(input, callback) {
  var form = new FormData();
  // If there is just one file we will be able to do input.name
  if (input.name){
    var data = (isBuffer(input) ? input.toString('binary') : input);
    form.append("file", new Blob([data],{}), input.name, input.size);
  }
  else { // Else assume multiple files.
    for (var i = 0; i < input.length; i++) {
      console.log(input[i].name);
      var data = (isBuffer(input[i]) ? input.toString('binary') : input[i]);
      console.log(input);
      form.append("file",new Blob([data],{}), input[i].name, input[i].size);
    }
  }
  request({
    callback: callback,
    method:"POST",
    uri:"/add?w", // ?w = -w, --wrap-with-directory bool   - Wrap files with a directory object
    payload:form,
    accept: "application/json",
    transform: function(response) {
     return response ? JSON.parse(formatResponse(response)) : null;
    }
  });
};

ipfs.catText = function(ipfsHash, callback) {
  request({callback: callback, uri:("/cat/" + ipfsHash)})
};

ipfs.cat = ipfs.catText; // Alias this for now

ipfs.addJson = function(jsonObject, callback) {
  var jsonString = JSON.stringify(jsonObject);
  ipfs.add(jsonString, callback);
};

ipfs.catJson = function(ipfsHash, callback) {
  ipfs.catText(ipfsHash, function (err, jsonString) {
    if (err) callback(err, {});
    var jsonObject = {};
    try {
      jsonObject = typeof jsonString === 'string' ?  JSON.parse(jsonString) : jsonString;
    } catch (e) {
      err = e;
    }
    callback(err, jsonObject);
  });
};

// From https://github.com/feross/is-buffer
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

function formatResponse(response){
  response = response.replace(/(?:\r\n|\r|\n)/g, '');
  var split = response.split("}{");
  var formatted = "[";
  for (var i = 0; i < split.length; i++) {
    if (i != split.length-1)
      formatted += split[i] + "},{";
    else
      formatted += split[i] +="]";
  }
  return formatted;
}

if (window !== 'undefined') {
  window.ipfs = ipfs;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ipfs;
}
})();
