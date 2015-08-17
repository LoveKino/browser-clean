browser-clean
=================================== 
browser-clean is a tool to clean your web page, include cleaning objects and original events.

Background
----------------------------------
There are some scenes that you need to release some objects, nodes or listeners. Especially in SPA projects.

In SPA projects, we switch pages and we need to release memory of last page. Thoese memory contains some objects, some nodes and some listeners.

In the past, we do that cleaning work by hand, the code may like: 
```
some.on("switchPage", function(){
    window.page1 = undefined;
    window.cache = undefined;
    // ...
    node1.removeListener("click", handler);
    node2.removeListener("click", handler);
    // ...
    pager1Node.remove();
    // ...
})
```
Right now, we want to do something to make this process automation, and "browser-clean" is the tool to achieve this goal.

Install and import
-----------------------------------
```
npm install browser-clean
```
use this one in your web project:
```
/browser/browser-clean.js
<script src="../../browser/browser-clean.js"></script>
```

Usage
-----------------------------------
Two parts, how to release objects and how to release original listeners.

There are two main steps for this thing to work, record and clean. Chose the right status to record objects and events, when you need clean page, just call clean method.

Record looks like:
```
browserCleaner.record({
    objects:[], // this config is for objects
    events: {}  // this config is for events
});
```
Clean looks like:
```
browserCleaner.clean();
```
How to use these api exactly, see next parts.

## How to release objects

When clean pages, there are some objects we want to do the "recovery" effection. Especaily global object (window).
In SPA, when we switch pages (page1 to page2), we just want to go back to the state before loading page1 (initial state), this is a "recovery" requirement. Page1 state may have some extra object and some missing attibutes related to initial state, we record initial objects state, and we "recovery" them when I want.

See the api: 
```
// record some objects
browserCleaner.record({
	objects: [{
		target: window,
		opts:{
			ignore: [/webkit/, "location", "document.location", "localStorage", "name", "sessionStorage", "history"]
		}
	}]
});
```
* target  
  Target object will be recorded, when clean it will be recoveried.
* ignore
  Ignore config illustrate some attributes of objects will be ignored. It means those attributes will not be record or recoveried, they are just been ignored.
  
  There are three type in ignore list, string regExp and function.

  If it's a string, it means the path of the attribute. For example, "document.location" mean the attribute of window["document"]["lcoation"].
  
  If it's a regExp, it will test every attibute's path. If true, the attribute will be ignored.
  
  If it's a function, it accept every attibute's path as param. If the result of the function is true, the attribute will be ignored.
```
// will be recoveried when clean
browserCleaner.clean();
```

## How to release listeners
The thought of release listeners is that we release all events we add but the ignored events when we chose to clean.

```
browserCleaner.record({
     events: {
         on: true,
         ignores: [{
            node: document.body,
            type: "click",
            handler: handler
         }]
     }
});
```
```
// released when clean
browserCleaner.clean();
```
* on

  If on is true, this function will be actived. Otherwise, listener release function won't work.

* ignores

  It's a white list. Event contained by it will be ignored. Every ignored event contains three attributes, they are:<br>
  (1) node  the element include window.<br>
  (2) type  the event type.<br>
  (3) handler the reference of event handler.<br>

* you should record first, before you add some events. And please use addEventListener(attachEvent in IE) and removeEventListener(detachEvent in IE).

* use addEventIgnore interface to append ignores list and any place you want.
```
browserCleaner.addEventIgnore(document.body, "click", click2);
```

Todo
--------------------------------------------------
1. more tests
2. test browser compatibility

