// make sure we're not in an iframe
// else we might double post in firefox
try { if(window.top === window){

var DOMAIN    = '0.0.0.0:3000',
    PROTOCOL  = 'http',
    VERSION   = '1.1.2',
    PLATFORM  = (typeof chrome !== 'undefined' ? 'chrome' : (typeof safari !== 'undefined' ? 'safari' : 'firefox')),
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

var relay_message = function(message){
  console.log('message', message);
  var func = _this[message.func];
  delete message.func;
  func(message);
}

switch(PLATFORM){
  case 'chrome':
    chrome.extension.onRequest.addListener(
      function(request, sender, sendResponse){
        replay_message(request);
        sendResponse({}); // close the connection
      }
    );
    break;
  case 'firefox':
    self.on('message', relay_message);
    break;
  case 'safari':
    console.log('on safari');
    safari.application.addEventListener('message', relay_message, false);
    break;
}

} } catch(err){ } // end frame check
