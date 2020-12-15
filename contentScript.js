var la = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var gr = ["α","β","ψ","δ","ε","φ","γ","η","ι","ξ","κ","λ","μ","ν","ο","π","","ρ","σ","τ","θ","ω","ς","χ","υ","ζ","Α","Β","Ψ","Δ","Ε","Φ","Γ","Η","Ι","Ξ","Κ","Λ","Μ","Ν","Ο","Π","","Ρ","Σ","Τ","Θ","Ω","Σ","Χ","Υ","Ζ"];

var forceLowercase = true;

function transliterate(char)
{
	var theChar = (forceLowercase) ? char.toLowerCase() : char;
	var idx = la.indexOf(theChar);
	if (idx > -1)
	{
		return gr[idx];
	}
	else
	{
		return char;
	}
}

function transformTypedChar(origChars, key) {

	var charsToReplace = 0;
	var mappedChar = "";
    if (origChars.length > 0 && origChars == "α" && key == "1") {
    	mappedChar = "ά"
    	charsToReplace = 1;
    }
    else if (origChars.length > 0 && origChars == "ά" && key == "1") {
    	mappedChar = "α"
    	charsToReplace = 1;
    }
    return [charsToReplace, mappedChar];
}

function accentSyllable(evt) {
    var val = this.value;
    evt = evt || window.event;

    var charCode = typeof(evt.which) == "number" ? evt.which : evt.keyCode;
    //console.log(charCode);

    if (charCode && charCode > 64 && charCode < 123)
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
    else if (charCode && charCode > 47 && charCode < 58) { //0-9 are 48-57
        var key = String.fromCharCode(charCode);

        var start, end;
        if (typeof(this.selectionStart) == "number" && typeof(this.selectionEnd) == "number") {
        	//console.log("1111");
            // Non-IE browsers and IE 9
            start = this.selectionStart;
            end = this.selectionEnd;

            // Transform typed character
	        var ret = transformTypedChar(val.slice(start - 1, start), key);
	        var mappedChar = ret[1];
	        var charsToReplace = ret[0];
 
            if (charsToReplace > 0 && mappedChar != "")
            {
	            this.value = val.slice(0, start - charsToReplace) + mappedChar + val.slice(end);
	            // Move the caret
	            this.selectionStart = this.selectionEnd = start + 1 - charsToReplace;
        	}

        } else if (document.selection && document.selection.createRange) {
        	//console.log("2222");
            // For IE up to version 8
            var selectionRange = document.selection.createRange();
            var textInputRange = this.createTextRange();
            var precedingRange = this.createTextRange();
            var bookmark = selectionRange.getBookmark();
            textInputRange.moveToBookmark(bookmark);
            precedingRange.setEndPoint("EndToStart", textInputRange);
            start = precedingRange.text.length;
            end = start + selectionRange.text.length;

            // Transform typed character
	        var ret = transformTypedChar(val.slice(start - 1, start), key);
	        var mappedChar = ret[1];
	        var charsToReplace = ret[0];

            if (charsToReplace > 0 && mappedChar != "")
            {
	            this.value = val.slice(0, start) + mappedChar + val.slice(end);
	            start++;

	            // Move the caret
	            textInputRange = this.createTextRange();
	            textInputRange.collapse(true);
	            textInputRange.move("character", start - (this.value.slice(0, start).split("\r\n").length - 1));
	            textInputRange.select();
	        }
        }
        return false;
    }
    return true;
}
$("input").keypress(accentSyllable);
/*
document.onkeypress = function() {
  alert('test');
};
*/

