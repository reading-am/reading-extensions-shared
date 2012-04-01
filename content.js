// make sure we're not in an iframe
// else we might double post in firefox
try { if(window.frameElement === null){

var DOMAIN    = 'reading.am',
    PROTOCOL  = 'https',
    VERSION   = '1.1.2',
    PLATFORM  = (typeof chrome !== 'undefined' ? 'chrome' : 'firefox'),
    head      = document.getElementsByTagName('head')[0],
    loaded    = false,
    _this     = this; // "self" is reserved in firefox

var load = function(){
  var vars = document.createElement('script'),
      script = document.createElement('script');

  vars.appendChild(document.createTextNode('var reading = {platform:"'+PLATFORM+'",version:"'+VERSION+'"};'));
  script.src = PROTOCOL+"://"+DOMAIN+"/assets/bookmarklet/loader.js";

  head.appendChild(vars);
  head.appendChild(script);
  return true;
};

var submit = function(params){
  if(!loaded) loaded = load();
  var script = document.createElement('script'),
      url   = params.url,
      title = params.title ? '"'+params.title+'"' : 'null';
  script.appendChild(document.createTextNode(
    'var r_submit = function(){ reading.submit({url:"'+url+'", title:'+title+'}) };'+
    'if(reading.ready) r_submit();'+
    'else document.addEventListener("reading.ready", r_submit);'
  ));
  head.appendChild(script);
};

var loc = document.location.href,
    ref = document.referrer;
if(
  // don't post while still on Reading
  loc.indexOf(DOMAIN) == -1
  // don't post on oauth pages
  && loc.indexOf('/oauth/') == -1
  // account for http and https
  && (ref.indexOf(DOMAIN) == 7 || ref.indexOf(DOMAIN) == 8)
  // exclude auth and settings sections
  && ref.indexOf('/settings') == -1
  ){
  // if we came from Reading, auto post
  submit({url: document.location.href, title: document.title});
}

switch(PLATFORM){
  case 'chrome':
    chrome.extension.onRequest.addListener(
      function(request, sender, sendResponse){
        _this[request.func](request);
        sendResponse({}); // close the connection
      }
    );
    break;
  case 'firefox':
    self.on('message', function(request){
      _this[request.func](request);
    });
    break;
}

} } catch(err){ } // end frame check
