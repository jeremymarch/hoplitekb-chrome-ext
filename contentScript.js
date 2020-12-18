// Loads a WebAssembly dynamic library, returns a promise.
// imports is an optional imports object
function loadWebAssembly(filename, imports) {
  return fetch(filename)
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.compile(buffer))
    .then(module => { 
      return WebAssembly.instantiate(module, imports);
    });
}

var wasmBuffer;
var accentSyllableWASM;
loadWebAssembly(chrome.runtime.getURL("hoplitekb.wasm"))
  .then(instance => {
    var exports = instance.exports;
    accentSyllableWASM = exports.accentSyllable2;
    var memory = exports.memory;

    wasmBuffer = new Uint16Array(memory.buffer, 0, 1024);
  }
);

var la = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var gr = ["α","β","ψ","δ","ε","φ","γ","η","ι","ξ","κ","λ","μ","ν","ο","π","","ρ","σ","τ","θ","ω","ς","χ","υ","ζ","Α","Β","Ψ","Δ","Ε","Φ","Γ","Η","Ι","Ξ","Κ","Λ","Μ","Ν","Ο","Π","","Ρ","Σ","Τ","Θ","Ω","Σ","Χ","Υ","Ζ"];
var forceLowercase = true;
function transliterate(char)
{
	var theChar = (forceLowercase) ? char.toLowerCase() : char;
	var idx = la.indexOf(theChar);
	if (idx > -1) {
		return gr[idx];
	}
	else {
		return char;
	}
}

function accentSyllable(origChars, key) {
	var len = origChars.length;
	//add letter and any combining diacritics to the buffer as code points
	for (var i = 0; i < len; i++) {
		wasmBuffer[i] = origChars.codePointAt(i);
	}

    len = accentSyllableWASM(wasmBuffer.byteOffset, len, key, 1, 1);

    //transform the returned code points back to a string
	var newLetter = "";
	for (var i = 0; i < len; i++) {
		newLetter += String.fromCodePoint(wasmBuffer[i]);
	}
    return [len, newLetter];
}

function handleKey(evt) {
    var val = this.value;
    evt = evt || window.event;

    var charCode = typeof(evt.which) == "number" ? evt.which : evt.keyCode;

    if (charCode && charCode > 64 && charCode < 123) //letter
    {
	    var start = this.selectionStart;
        var end = this.selectionEnd;
    	var key = String.fromCharCode(charCode);

    	var mappedChar = transliterate(key);
    	var charsToReplace = 0;
	    this.value = val.slice(0, start - charsToReplace) + mappedChar + val.slice(end);
        // Move the caret
        this.selectionStart = this.selectionEnd = start + 1 - charsToReplace;
        return false;
    }
    else if (charCode && charCode > 47 && charCode < 58) { //number: 0-9 are 48-57
        var key = String.fromCharCode(charCode);
        var hckey = 0;
        switch( parseInt(key) ) {
            case 1:
                hckey = 5; //rough
                break;
            case 2:
                hckey = 6; //smooth
                break;
            case 3:
                hckey = 1; //acute
                break;
            case 4:
                hckey = 3; //grave
                break;
            case 5:
                hckey = 2; //circumflex
                break;
            case 6:
                hckey = 4; //macron
                break;
            case 7:
                hckey = 10; //breve
                break;
            case 8:
                hckey = 7; //iota subscript
                break;
            case 9:
                hckey = 9; //diaeresis
                break;
            case 0:
                hckey = 11; //underdot
                break;
        }
        var start, end;
        if (typeof(this.selectionStart) == "number" && typeof(this.selectionEnd) == "number") {
            // Non-IE browsers and IE 9+
            start = this.selectionStart;
            end = this.selectionEnd;

            var combining = [0x0300, 0x0301, 0x0304, 0x0306, 0x0308, 0x0313, 0x0314, 0x0323, 0x0342, 0x0345];
            var off = 1;
            for (var i = start; i > -1; i--)
            {
            	if (combining.indexOf(val.codePointAt(i - 1)) > -1) {
            		off++;
            	}
            	else {
            		break;
            	}
            }
	        var ret = accentSyllable(val.slice(start - off, start), hckey.toString());
	        var newLetter = ret[1];
	        var charsToReplace = start - (start - off);
 
            if (ret[0] > 0 && newLetter != "")
            {
            	//update the input/textarea
	            this.value = val.slice(0, start - charsToReplace) + newLetter + val.slice(end);
	            // Move the caret
	            this.selectionStart = this.selectionEnd = (start - charsToReplace) + ret[0];
        	}

        } 
        return false;
    }
    return true;
}

$("input").keypress(handleKey);
$("textarea").keypress(handleKey);

