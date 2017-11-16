// make sure we're not in an iframe
// else we might double post in firefox
try { if(window.top === window){

var DOMAIN    = 'www.reading.am',
    PROTOCOL  = 'https',
    // uncomment for local testing
    // DOMAIN = 'www.reading.dev:3000',
    // PROTOCOL = 'http',
    ROOT_URL  = PROTOCOL+'://'+DOMAIN,
    VERSION   = '1.1.5',
    PLATFORM  = (typeof chrome !== 'undefined' ? 'chrome' : (typeof safari !== 'undefined' ? 'safari' : 'firefox')),
    head      = document.getElementsByTagName('head')[0],
    loaded    = false,
    _this     = this; // "self" is reserved in firefox

var load = function(){
  var vars = document.createElement('script'),
      script = document.createElement('script');

  vars.appendChild(document.createTextNode('var reading = {platform:"'+PLATFORM+'",version:"'+VERSION+'"};'));
  script.src = ROOT_URL+"/assets/bookmarklet/loader.js";

  head.appendChild(vars);
  head.appendChild(script);
  return true;
};

var submit = function(params){
  if(!loaded) loaded = load();
  var script = document.createElement('script');
  script.appendChild(document.createTextNode(
    'var r_submit = function(){ reading.submit('+JSON.stringify(params)+') };'+
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
};

// only used by Safari at the moment
var get_parent = function(curNode, parentType){
  curNode = curNode.parentNode;
  parentType = parentType.toUpperCase();
  while (curNode){
    if(curNode.nodeName == parentType) return curNode;
    else curNode = curNode.parentNode;
  }
  return false;
};

switch(PLATFORM){
  case 'chrome':
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse){
        relay_message(request);
        sendResponse({}); // close the connection
      }
    );
    break;
  case 'firefox':
    self.on('message', relay_message);
    break;
  case 'safari':
    safari.self.addEventListener('message', function(event){
      var message  = event.message;
      message.func = event.name;
      relay_message(message);
    }, false);
    // safari requires that you check contextmenu context in the injected script
    document.addEventListener('contextmenu', function(event){
      var name  = event.target.nodeName.toLowerCase(),
          nodes = [{
            name: name,
            url: name == 'a' ? event.target.href : event.target.src
          }];
      if(parent = get_parent(event.target, 'a')){
        nodes.push({name: parent.nodeName.toLowerCase(), url: parent.href});
      }
      // set userInfo so we can access it in the global html page
      safari.self.tab.setContextMenuEventUserInfo(event, nodes);
    }, false);
    break;
}

} } catch(err){ } // end frame check
