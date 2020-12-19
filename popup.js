//https://stackoverflow.com/questions/45179138/sending-message-from-popup-to-content-script-chrome-extension

function toggle() {

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    chrome.tabs.sendMessage(tabs[0].id, {type:"toggleEnabled"}, function(response){

	        document.getElementById("isEnabled").innerHTML = (response) ? "enabled." : "disabled.";
	        document.getElementById("toggleEnabled").innerHTML = (response) ? "Disable" : "Enable";
	        
	    });
	});
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"getEnabled"}, function(response){

    	document.getElementById("isEnabled").innerHTML = (response) ? "enabled." : "disabled.";
        document.getElementById("toggleEnabled").innerHTML = (response) ? "Disable" : "Enable";

    });
});

document.getElementById('toggleEnabled').onclick = toggle;
