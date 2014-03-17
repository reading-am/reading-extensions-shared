var ROOT_DOMAIN = 'reading.am';
// uncomment for local testing
// ROOT_DOMAIN = 'reading.dev:3000';

var CSP = exports.CSP = {
  inject: function(csp){
    var defsrcs = ['http://*.'+ROOT_DOMAIN, 'https://*.'+ROOT_DOMAIN],
        // via: https://developer.mozilla.org/en-US/docs/Security/CSP/CSP_policy_directives
        directives = {
          'default-src': defsrcs,
          'script-src': [
            "'unsafe-eval'",
            'http://*.'+ROOT_DOMAIN,
            'https://*.'+ROOT_DOMAIN
          ],
          'object-src': defsrcs,
          'img-src':    defsrcs,
          'media-src':  defsrcs,
          'frame-src':  defsrcs,
          'font-src':   defsrcs,
          'connect-src': [
            'http://*.'+ROOT_DOMAIN,
            'https://*.'+ROOT_DOMAIN,
            "ws://*.pusherapp.com",
            "wss://*.pusherapp.com",
            // SockJS fallback endpoints
            "http://*.pusher.com",
            "https://*.pusher.com"
          ],
          'style-src':  defsrcs,
          'report-uri': defsrcs
        };

    for (var key in directives){
      // Don't append if it's set to a wildcard,
      // the browser will then ignore the wildcard
      if(csp.indexOf(key+" *") == -1){
        csp = csp.replace(key, key+" "+directives[key].join(" "));
      }
    }
    return csp;
  }
};
