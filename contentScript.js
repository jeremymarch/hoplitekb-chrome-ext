

// fetch('hoplitekb_wasm_rs_bg.wasm').then(response =>
//     response.arrayBuffer()
//   ).then(bytes =>
//     WebAssembly.instantiate(bytes)
//   ).then(results => {
//     var toggle = results.instance.exports.toggle;
//     var translit = results.instance.exports.translit;
//   });

//https://stackoverflow.com/questions/49611290/using-webassembly-in-chrome-extension
//https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
//https://stackoverflow.com/questions/51114093/vanilla-javascript-intercept-key-on-input-and-change-key-value
//https://levelup.gitconnected.com/creating-a-psychedelic-webassembly-chrome-extension-9c3a5d806e4a

// (async () => {
//     const src = chrome.runtime.getURL("hoplitekb_wasm_rs.js");
//     var contentMain = await import(src);
//     //contentMain.main();
//   })();

//   var importObject = {
//     imports: { }
//   };
//  var response = null;
//  var bytes = null;
//  var results = null;
//  var toggle;
//  var translit;
//  var wasmPath = chrome.runtime.getURL("hoplitekb_wasm_rs_bg.wasm");
//  fetch(wasmPath).then(response =>
//      response.arrayBuffer()
//      ).then(bytes =>
//         WebAssembly.instantiate(bytes, importObject)
//          ).then(results => {
//             toggle = results.instance.exports.toggle;
//             translit = results.instance.exports.translit;
//    });

   import { toggle, translit, default as init } from 'hoplitekb_wasm_rs.js';

        async function run() {
            await init('hoplitekb_wasm_rs_bg.wasm');
            // make the function available to the browser
            window.toggle = toggle;
            window.translit = translit;
        }
        run(); 


const _MACRON     = 1;
const _SMOOTH     = 2;
const _ROUGH      = 4;
const _ACUTE      = 8;
const _GRAVE      = 16;
const _CIRCUMFLEX = 32;
const _IOTA_SUB   = 64;
const _DIAERESIS  = 128;
const _BREVE      = 256;
const _UNDERDOT   = 512;
const _CASE_SENSITIVE = 1024; //, not used yet
const _HK_IGNORE_UNKNOWN_CHARS = 2048;
    function toggle_diacritic(str, pos, diacritic, unicodeMode) {
        if (pos < 0 || pos > str.length) {
            return { str: str, pos: str.length };
        }
        const max_combining_chars = 10;
        let replace_len = Math.min(max_combining_chars + 1, pos);
        let s = str.slice(pos - replace_len, pos);
        let res = toggle(s, parseInt(diacritic), false, parseInt(unicodeMode));
    
        let new_pos = (pos - replace_len) + res.length;
    
        return { str: str.slice(0, pos - replace_len) + res + str.slice(pos), pos: new_pos };
    }
    
    //let forceLowercase = true;
    let unicodeMode = 0;
    function handleKey(e) {
        console.log("key: " + e.key);

        if (!enabled) {
		    return true;
	    }

        // var events = document.createEvent('Event');
        // events.initEvent('keydown',true,true);
        // elem.dispatchEvent(events);

        //if (typeof(this.selectionStart) == "number" && typeof(this.selectionEnd) == "number") {
            console.log("blah1");
            let text = this.value;
            let start = this.selectionStart;
            let key = e.key;//.toLowerCase(); //force lower case
    
            if ( !isNaN( parseInt(key) ) ) {
                console.log("blah2");
                unicodeMode = document.querySelector("input[name=unicodeMode]:checked").value;
                let res = toggle_diacritic(text, start, key, unicodeMode);
                this.value = res.str;
                this.selectionStart = this.selectionEnd = res.pos;
                e.preventDefault();
                console.log(res.str);
                return false;
            }
            else if (key.length == 1) { //len == 1 to exclude keys like "ENTER", etc.
                let greek_letter = translit(key); //returns \0 if the character cannot be transliterated
                if (greek_letter !== "\0") {
                    console.log(greek_letter);
                    let end = this.selectionEnd;            
                    this.value = text.slice(0, start) + greek_letter + text.slice(end);
                    this.selectionStart = this.selectionEnd = start + 1;
                    e.preventDefault();
                    
                    return false;     
                }
            }
        //}
        return true; // true allows most punctuation, etc. pass through
    }

// $("input").keypress(handleKey);
// $("textarea").keypress(handleKey);


var elem = document.querySelector(".docs-texteventtarget-iframe").contentDocument.activeElement;
elem.addEventListener('keyup', handleKey, false);
// elem.addEventListener('keyup',function(e){
//     console.log('check check2: ' + enabled + ", " + e.key);
// }, false);

// var events = document.createEvent('Event');
// events.initEvent('keyup',true,true);
// elem.dispatchEvent(events);

var enabled = false;
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "getEnabled":
                sendResponse(enabled);
            	break;
            case "toggleEnabled":
            	enabled = !enabled;
                sendResponse(enabled);
                if (enabled) {
                	//$("input").css("font-family","newathFF,newathChrome");
					//$("textarea").css("font-family","newathFF,newathChrome");
                }
                //leave the fonts on, or we lose the diacritics
                /*else
                {
                	$("input").css("font-family","");
					$("textarea").css("font-family","");
                }*/
            	break;
        }
    }
);


