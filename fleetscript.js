// ==UserScript==
// @name		Fleet script
// @namespace	http://war-facts.com
// @version		0.1
// @description	Script that adds functionality to the War-Facts fleet interface.
// @include		http://*.war-facts.com/fleet_navigation*
// @copyright	2013+, Everyone
// ==/UserScript==

// Fleet Info script by Apache1990
function tonnage()
{
	var req, tonnage, shipCount, pages;

	// Stop and grab fleet ID for later
	// [BEGIN] Fleet ID getter stolen from WF-Explore Standard v0.5
	// Get objFleetMain (<p> tag), depending on what instance we are playing
		var objFleetMain = document.getElementsByName('form2')[0].parentNode.parentNode.parentNode.parentNode.parentNode;
	// Get the fleet id. We could just get this from the URL, but that would be too easy.
		var fleet1 = objFleetMain.getElementsByTagName('strong')[1].innerHTML.match(/Fleet Registry #(\d+)/)[1];
	// [END] Fleet ID getter stolen from WF-Explore Standard v0.5

	function loadXMLDoc(url)
	{
	    // branch for native XMLHttpRequest object
	    if (window.XMLHttpRequest) {
	        req = new XMLHttpRequest();
	        req.onreadystatechange = processReqChange;
	        req.open("GET", url, true);
	        req.send(null);
	    }
	}

	function processReqChange() 
	{
	    // only if req shows "complete"
	    if (req.readyState == 4) {
	        // only if "OK"
	        if (req.status == 200) {
	            pages = req.responseText;
	            if(pages.indexOf("tfleet="+fleet1) != -1){
			    pages = pages.substring(pages.indexOf("tfleet="+fleet1));
		            pages = pages.substring(pages.indexOf("<td class=strong>")+3);
		            if(window.location.hostname == "www4.war-facts.com" || window.location.hostname == "test.war-facts.com"){
		            	pages = pages.substring(pages.indexOf("<td class=strong>")+3);
		            }
		            pages = pages.substring(pages.indexOf("<td class=strong>")+17);
		            shipCount = pages.substring(0, pages.indexOf("</td>"));
		            pages = pages.substring(pages.indexOf("<td class=strong>")+17);
		            tonnage = pages.substring(0, pages.indexOf("</td>"));
			    // Write Output
			    var minitable = document.createElement('table');
		            var row1 = document.createElement('tr');
		            var shipcount2 = document.createElement('td');
		            shipcount2.setAttribute("class", "head");
		            var tonnage2 = document.createElement('td');
		            tonnage2.setAttribute("class", "head");
		            var tonnage3 = document.createElement('td');
		            tonnage3.innerHTML = tonnage;
		            tonnage3.setAttribute("class", "strong");
		            var shipcount3 = document.createElement('td');
		            shipcount3.innerHTML = shipCount;
		            shipcount3.setAttribute("class", "strong");
		            shipcount2.innerHTML = "Ship Count:";
		            tonnage2.innerHTML = "Tonnage:";
		            row1.appendChild(shipcount2);
		            row1.appendChild(shipcount3);
		            row1.appendChild(tonnage2);
		            row1.appendChild(tonnage3);
		            minitable.appendChild(row1);
		            var stats= document.getElementsByTagName('strong')[1];
		            stats.appendChild(minitable);
		    }else{
			    var noScan = document.createElement('table');
			    noScan.innerHTML = "<tr><td class='strong'>Fleet Info Unavailable: Scanner Required to Get Fleet Info in Open Space</td></tr>";
			    var stats= document.getElementsByTagName('strong')[1];
		            stats.appendChild(noScan);
		    }
	        } else {
	            alert("There was a problem retrieving the perimeter scan data:\n" + req.statusText);
	        }
	    }
	}

	loadXMLDoc("http://" + window.location.hostname + "/extras/scan.php?fleet=" + fleet1);
}

// Auto Perimeter Scan 1.0.1b by guardian
function autoScan()
{
	//Please note original code is by Ravenlord , revision 1.0.2 is by guardian

	/* Revision History +/

	version 1.0.1  -  12/28/2006 
	- added "loading" notice to the page so the user knows when the lookup is done

	version 1.0.1b - 26/02/2011 (I had to fix 1.0.1 cause I can't get a link to 1.0.3 ,  if you have please send
	- Corrected it so it gets the correct data for ships and tonnage (look at //)
	- Changed the parseInt to parseFloat so that id also shows probes with 0.1 tonnage etc
	- Added shipTons=shipTons.toFixed(1) before displaying so as to avoid really long numbers.
	- Set deafult to use_Outside100 = true;

	/+ End Revision History */


	var use_APScan     = true;
	var use_Outside100 = true;   // Set to true to perform a perim scan every time, false if only when at 100^3

	var base = window.location.href;
	var instance = base.substring(base.indexOf("//") + 2);
	instance = instance.substring(0, instance.indexOf("."));


	window.loadAutoPerimScan = function() {


	    if (!use_APScan) return false;
	    
	    var fleetNavTable = document.getElementsByName('form2')[0].getElementsByTagName('table')[0];
	    if (!fleetNavTable) return false;
	    
	    // If we're in transit, combat, etc., there'll only be one row in the table; bomb out now
	    if (fleetNavTable.rows.length == 1) return false;
	    
	    // First, check to see if we're at 100^3, or if it even matters
	    if (!use_Outside100) {
	        var fleetCoordsCell = fleetNavTable.rows[1].cells[3];
	        if (fleetCoordsCell.innerHTML.indexOf('100, 100, 100 local') == -1) return false;
	    }

	    // Grab the fleet ID - we'll need it later to perform the perimeter scan
	    var fleetPosCell = fleetNavTable.rows[1].cells[1];
	    var fleetID = fleetPosCell.getElementsByTagName('a')[0].href.replace(/^.*fleet=(\d+).*$/,"$1");
	    if (!fleetID) return false;
	    
	    // Let the user know we're working...
	    fleetPosCell.appendChild(document.createElement('br'));
	    fleetPosCell.appendChild(document.createTextNode('(loading...)'));

	    // Grab Perimeter Scan
	    function getPerimeterScan(f_id) {
	        GM_xmlhttpRequest({
	            method:"GET",
	            url:'http://' + instance + '.war-facts.com/extras/scan.php?fleet=' + f_id,
	            onload:parsePerimeterScan
	        });
	        
	        function parsePerimeterScan(resp) {
	            // Clear the loading message
	            fleetPosCell.removeChild(fleetPosCell.lastChild);
	            fleetPosCell.removeChild(fleetPosCell.lastChild);
	            
	            var page = resp.responseText;

	            // Make sure we see the Position marker in the header and jump to it
	            if (page.indexOf('Position') == -1) return false;
	            page = page.substring(page.indexOf('Position') + 8);
	            page = page.substring(page.indexOf('</tr>') + 5);

	            // If there's a Wormhole, it'll always be the first in the list, so check for it first
	            if (page.indexOf('Wormhole!') > -1) {
	                page = page.substring(page.indexOf('Wormhole!') + 9);
	                var wh_coords = page.substring(page.indexOf('maingame>') + 9, page.indexOf(' local'));
	                
	                var matches = wh_coords.match(/(\-?\d+),\s*(\-?\d+),\s*(\-?\d+)/);
	                if (matches) {
	                    var url = 'http://' + instance + '.war-facts.com/fleet_navigation.php';
	                    url    += '?fleet=' + fleetID + '&mtype=jump&tpos=local';
	                    url    += '&x=' + matches[1] + '&y=' + matches[2] + '&z=' + matches[3];
	                    
	                    fleetPosCell.appendChild(document.createElement('br'));
	                    
	                    var linkie = document.createElement('a');
	                    linkie.setAttribute('href',url);
	                    linkie.appendChild(document.createTextNode('Wormhole!'));
	                    fleetPosCell.appendChild(linkie);
	                }
	                
	                page = page.substring(page.indexOf('</tr>') + 5);
	            }
	            
	            // Start looping through the rest of the rows of the table
	            var ships = {
	                'friends'  : { 'ships' : 0, 'tons' : 0 },
	                'neutrals' : { 'ships' : 0, 'tons' : 0 },
	                'enemies'  : { 'ships' : 0, 'tons' : 0 }
	            };
	            
	            while (page.indexOf('<tr>') > -1) {
	                var shipPtr;
	                var thisRow = page.substring(page.indexOf('<tr>') + 3, page.indexOf('</tr>'));
	                
	                // Make sure we're not on the last row and not looking at ourself
	                if (thisRow.indexOf('<strong>Total</strong>') == -1 &&
	                    thisRow.indexOf('>Self<') == -1) {
	                    // First, figure out what our relationship is to this fleet
	                    var fleetName = thisRow.substring(thisRow.indexOf('maingame>' + 9), thisRow.indexOf('</a>'));
	                    var matches   = fleetName.match(/font class=(\w+)>/);
	                    
	                    if (matches) {
	                        shipPtr = (matches[1] == 'friend') ? ships['friends'] : ships['enemies'];
	                    }
	                    else {
	                        shipPtr = ships['neutrals'];
	                    }
	                    
	                    // Now, count up the number of ships
	                    thisRow = thisRow.substring(thisRow.indexOf('</td>') + 5);
	                    thisRow = thisRow.substring(thisRow.indexOf('</td>') + 5);
		//commented out to get the correct data for ships and tonnage   thisRow = thisRow.substring(thisRow.indexOf('</td>') + 5);		
	                    
	                    var shipCount   = thisRow.substring(thisRow.indexOf('>') + 1, thisRow.indexOf('</td>'));
						// changed to parseFloat by guardian
	                    shipPtr['ships'] += parseFloat(shipCount);
	                    
	                    // ...then their tonnage
						
	                    thisRow = thisRow.substring(thisRow.indexOf('</td>') + 5);
	                    
	                    var shipTons   = thisRow.substring(thisRow.indexOf('>') + 1, thisRow.indexOf('</td>'));
						// changed to parseFloat by guardian
	                    shipPtr['tons'] += parseFloat(shipTons);
	                }

	                page = page.substring(page.indexOf('</tr>') + 5);
	            }
	            
	            // Now that we've tallied up the ship count, add any warnings to the page
	            if (ships['friends']) {
	                var shipPtr   = ships['friends'];
	                var shipCount = shipPtr['ships'];
	                var shipTons  = shipPtr['tons'];
	                
	                if (shipCount) {
	                    fleetPosCell.appendChild(document.createElement('br'));
	                    
	                    var strongTitle = document.createElement('strong');
	                    var fontTitle   = document.createElement('font');
	                    fontTitle.setAttribute('class','friend');
	                    fontTitle.appendChild(document.createTextNode('Friends:'));
	                    strongTitle.appendChild(fontTitle);
	                    fleetPosCell.appendChild(strongTitle);
	       
						shipTons = shipTons.toFixed(1);
	                    var shipText = ' ' + shipCount + ' ships (' + shipTons + ' tons)';
	                    fleetPosCell.appendChild(document.createTextNode(shipText));
	                }
	            }
	            
	            if (ships['neutrals']) {
	                var shipPtr   = ships['neutrals'];
	                var shipCount = shipPtr['ships'];
	                var shipTons  = shipPtr['tons'];
	                
	                if (shipCount) {
	                    fleetPosCell.appendChild(document.createElement('br'));
	                    
	                    var strongTitle = document.createElement('strong');
	                    strongTitle.appendChild(document.createTextNode('Neutrals:'));
	                    fleetPosCell.appendChild(strongTitle);
	                    
						shipTons = shipTons.toFixed(1);
	                    var shipText = ' ' + shipCount  + ' ships (' + shipTons + ' tons)';
	                    fleetPosCell.appendChild(document.createTextNode(shipText));
	                }
	            }
	            
	            if (ships['enemies']) {
	                var shipPtr   = ships['enemies'];
	                var shipCount = shipPtr['ships'];
	                var shipTons  = shipPtr['tons'];
	                
	                if (shipCount) {
	                    fleetPosCell.appendChild(document.createElement('br'));
	                    
	                    var strongTitle = document.createElement('strong');
	                    var fontTitle   = document.createElement('font');
	                    fontTitle.setAttribute('class','enemy');
	                    fontTitle.appendChild(document.createTextNode('Enemies:'));
	                    strongTitle.appendChild(fontTitle);
	                    fleetPosCell.appendChild(strongTitle);
	                    
						shipTons = shipTons.toFixed(1);
	                    var shipText = ' ' + shipCount + ' ships (' + shipTons + ' tons)';
	                    fleetPosCell.appendChild(document.createTextNode(shipText));
	                }
	            }
	        }
	    }
	    
	    getPerimeterScan(fleetID);
	}

	window.addEventListener('load',window.loadAutoPerimScan,false);
}

// WF-QuickLaunch 2.0 by William Frye (aka Carabas)
function quickLaunch()
{
	/* WF-QuickLaunch 2.0
	   by William Frye (aka Carabas)
	   For Warring Factions (http://war-facts.com/)
	   =========================================================
	   This script is provided "AS-IS" with no warranties
	   whatsoever, expressed or implied. USE AT YOUR OWN RISK.
	   =========================================================
	   This script will enable you to quickly launch your fleet
	   from the drop down menus, bypassing the navigation
	   "confirmation screen." In other words, you will not have
	   to click "Launch!" anymore!

	   - Your Colonies
	   - Rally Points
	   - Local Locations
	   - Local Colonies

	   However, local and global coordinates are not automatically
	   launched. This was intentional, as you may want to view
	   distance and course before launching.

	CHANGELOG
	=========

	 - November 2006: Most functions were moved to the global
	   namespace to allow other scripts to use it

	 - Sometime 2006: Added Quicklaunch Key.
	 
	 - v2.1, May 2012 = fixed for H7 on FF12 and Chrome (by Seko)
	*/

	// Lets make sure we're not moving.
	var objTransitCheck = document.evaluate("//b[text()='In Transit']", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	objTransitCheck = objTransitCheck.iterateNext();
	if (objTransitCheck) { return }

	// Do we have the right form?
	var form2	= document.getElementsByName('form2')[0]
	if ( !form2 ) { return }

	// Let us grab the fields we need.
	var tcolony2, tcolony3, rallypoint, tworld2;
	tcolony2	= document.getElementsByName('tcolony2')[0];
	tcolony3	= document.getElementsByName('tcolony3')[0];
	rallypoint	= document.getElementsByName('rallypoint')[0];
	tworld2		= document.getElementsByName('tworld2')[0];

	unsafeWindow.GM_WF_QuickLaunch_qlcolony = function() {

	    // If we selected a colony, either distant or local
	    var tcolony = document.createElement('input');
	    tcolony.type = 'hidden';
	    // The thing is, if we're not orbiting a planet, then tcolony2
	    // field will not exist. So, we'll have to check that it does
	    // exist before trying to access its value.
	    tcolony.value = tcolony3.value ? tcolony3.value : ( tcolony2 ? tcolony2.value : null );
	    tcolony.name = 'tcolony';
	    form2.appendChild(tcolony);

	    // Launch this fleet
	    unsafeWindow.GM_WF_QuickLaunch_quicklaunch();

	}

	//function GM_WF_QuickLaunch_qlworld() {
	unsafeWindow.GM_WF_QuickLaunch_qlworld = function() {

	    // If we selected a local planet
	    var tworld = document.createElement('input');
	    tworld.type = 'hidden';
	    // This gets tricky. It appears that if the value is negative,
	    // then we're looking at a system, not a world.
	    // ie The system entrance.
	    tworld.value = ( tworld2.value >= 0 ) ? tworld2.value : Math.abs(tworld2.value);
	    tworld.name = ( tworld2.value >= 0 ) ? 'tworld' : 'tsystem';
	    form2.appendChild(tworld);

	    // Launch this fleet
	    unsafeWindow.GM_WF_QuickLaunch_quicklaunch();

	}

	unsafeWindow.GM_WF_QuickLaunch_qlrallypoint = function() {

	    // Rally Points work as-is

	    // Launch this fleet
	    unsafeWindow.GM_WF_QuickLaunch_quicklaunch();

	}

	//function GM_WF_QuickLaunch_quicklaunch() {
	unsafeWindow.GM_WF_QuickLaunch_quicklaunch = function() {

	    // Finally, without verify, it would not launch!
	    var submit = document.createElement('input');
	    submit.setAttribute('type', 'submit');
	    submit.setAttribute('value', 'Launch!');
	    submit.setAttribute('name', 'verify');
	    submit.setAttribute('class', 'warn');
	    form2.appendChild(submit);

	    // Launch this fleet. Okay, for real this time.
	    submit.click();

	}

	if ( tcolony2 ) {
	    tcolony2.removeAttribute("onChange");
	    tcolony2.addEventListener("change", function() {unsafeWindow.GM_WF_QuickLaunch_qlcolony()}, true);
	}

	if ( tcolony3 ) {
	    tcolony3.removeAttribute("onChange");
	    tcolony3.addEventListener("change", function() {unsafeWindow.GM_WF_QuickLaunch_qlcolony()}, true);
	}

	if ( rallypoint ) {
	    rallypoint.removeAttribute("onChange");
	    rallypoint.addEventListener("change", function() {unsafeWindow.GM_WF_QuickLaunch_qlrallypoint()}, true);
	}

	if ( tworld2 ) {
	    tworld2.removeAttribute("onChange");
	    tworld2.addEventListener("change", function() {unsafeWindow.GM_WF_QuickLaunch_qlworld()}, true);
	}

	// End
}

function scoutHelper()
{
	Array.prototype.______array = '______array';

	var WF_JSON = {
	    org: 'http://www.JSON.org',
	    copyright: '(c)2005 JSON.org',
	    license: 'http://www.crockford.com/JSON/license.html',

	    stringify: function (arg) {
	        var c, i, l, s = '', v;

	        switch (typeof arg) {
	        case 'object':
	            if (arg) {
	                if (arg.______array == '______array') {
	                    for (i = 0; i < arg.length; ++i) {
	                        v = this.stringify(arg[i]);
	                        if (s) {
	                            s += ',';
	                        }
	                        s += v;
	                    }
	                    return '[' + s + ']';
			} else if (typeof arg.toJsonString != 'undefined') {
			    return arg.toJsonString();
	                } else if (typeof arg.toString != 'undefined') {
	                    for (i in arg) {
	                        v = arg[i];
	                        if (typeof v != 'undefined' && typeof v != 'function') {
	                            v = this.stringify(v);
	                            if (s) {
	                                s += ',';
	                            }
	                            s += this.stringify(i) + ':' + v;
	                        }
	                    }
	                    return '{' + s + '}';
	                }
	            }
	            return 'null';
	        case 'number':
	            return isFinite(arg) ? String(arg) : 'null';
	        case 'string':
	            l = arg.length;
	            s = '"';
	            for (i = 0; i < l; i += 1) {
	                c = arg.charAt(i);
	                if (c >= ' ') {
	                    if (c == '\\' || c == '"') {
	                        s += '\\';
	                    }
	                    s += c;
	                } else {
	                    switch (c) {
	                        case '\b':
	                            s += '\\b';
	                            break;
	                        case '\f':
	                            s += '\\f';
	                            break;
	                        case '\n':
	                            s += '\\n';
	                            break;
	                        case '\r':
	                            s += '\\r';
	                            break;
	                        case '\t':
	                            s += '\\t';
	                            break;
	                        default:
	                            c = c.charCodeAt();
	                            s += '\\u00' + Math.floor(c / 16).toString(16) +
	                                (c % 16).toString(16);
	                    }
	                }
	            }
	            return s + '"';
	        case 'boolean':
	            return String(arg);
	        default:
	            return 'null';
	        }
	    },
	    parse: function (text, ctors) {
	        var at = 0;
	        var ch = ' ';

	        function error(m) {
	            throw {
	                name: 'JSONError',
	                message: m,
	                at: at - 1,
	                text: text
	            };
	        }

	        function next() {
	            ch = text.charAt(at);
	            at += 1;
	            return ch;
	        }

	        function white() {
	            while (ch != '' && ch <= ' ') {
	                next();
	            }
	        }

	        function str() {
	            var i, s = '', t, u;

	            if (ch == '"') {
	outer:          while (next()) {
	                    if (ch == '"') {
	                        next();
	                        return s;
	                    } else if (ch == '\\') {
	                        switch (next()) {
	                        case 'b':
	                            s += '\b';
	                            break;
	                        case 'f':
	                            s += '\f';
	                            break;
	                        case 'n':
	                            s += '\n';
	                            break;
	                        case 'r':
	                            s += '\r';
	                            break;
	                        case 't':
	                            s += '\t';
	                            break;
	                        case 'u':
	                            u = 0;
	                            for (i = 0; i < 4; i += 1) {
	                                t = parseInt(next(), 16);
	                                if (!isFinite(t)) {
	                                    break outer;
	                                }
	                                u = u * 16 + t;
	                            }
	                            s += String.fromCharCode(u);
	                            break;
	                        default:
	                            s += ch;
	                        }
	                    } else {
	                        s += ch;
	                    }
	                }
	            }
	            error("Bad string");
	        }

	        function arr() {
	            var a = [];

	            if (ch == '[') {
	                next();
	                white();
	                if (ch == ']') {
	                    next();
	                    return a;
	                }
	                while (ch) {
	                    a.push(val());
	                    white();
	                    if (ch == ']') {
	                        next();
	                        return a;
	                    } else if (ch != ',') {
	                        break;
	                    }
	                    next();
	                    white();
	                }
	            }
	            error("Bad array");
	        }

	        function obj() {
	            var k, o = {};

	            if (ch == '{') {
	                next();
	                white();
	                if (ch == '}') {
	                    next();
	                    return o;
	                }
	                while (ch) {
	                    k = str();
	                    white();
	                    if (ch != ':') {
	                        break;
	                    }
	                    next();
	                    o[k] = val();
	                    white();
	                    if (ch == '}') {
	                        next();
	                        return o;
	                    } else if (ch != ',') {
	                        break;
	                    }
	                    next();
	                    white();
	                }
	            }
	            error("Bad object");
	        }

	        function num() {
	            var n = '', v;
	            if (ch == '-') {
	                n = '-';
	                next();
	            }
	            while (ch >= '0' && ch <= '9') {
	                n += ch;
	                next();
	            }
	            if (ch == '.') {
	                n += '.';
	                while (next() && ch >= '0' && ch <= '9') {
	                    n += ch;
	                }
	            }
	            if (ch == 'e' || ch == 'E') {
	                n += 'e';
	                next();
	                if (ch == '-' || ch == '+') {
	                    n += ch;
	                    next();
	                }
	                while (ch >= '0' && ch <= '9') {
	                    n += ch;
	                    next();
	                }
	            }
	            v = +n;
	            if (!isFinite(v)) {
	                error("Bad number");
	            } else {
	                return v;
	            }
	        }

	        function word() {
	            switch (ch) {
	                case 't':
	                    if (next() == 'r' && next() == 'u' && next() == 'e') {
	                        next();
	                        return true;
	                    }
	                    break;
	                case 'f':
	                    if (next() == 'a' && next() == 'l' && next() == 's' &&
	                            next() == 'e') {
	                        next();
	                        return false;
	                    }
	                    break;
	                case 'n':
	                    if (next() == 'u' && next() == 'l' && next() == 'l') {
	                        next();
	                        return null;
	                    }
	                    break;
	            }
	            error("Syntax error");
	        }

		function ctor() {
		    var name = '';
		    if (ch == '@') {
			next();
			while (ch == '.' || (ch.toUpperCase() >= 'A' &&
					     ch.toUpperCase() <= 'Z')) {
			    name += ch;
			    next();
			}
			var arg = val();
			if (name in ctors) {
			    return ctors[name](arg);
			} else {
			    error("Unknown ctor " + name);
			}
		    }
		    error("Bad ctor");
		}

	        function val() {
	            white();
	            switch (ch) {
		        case '@':
			    return ctor();
	                case '{':
	                    return obj();
	                case '[':
	                    return arr();
	                case '"':
	                    return str();
	                case '-':
	                    return num();
	                default:
	                    return ch >= '0' && ch <= '9' ? num() : word();
	            }
	        }

	        return val();
	    }
	};

	/***/

	window.GM_wfscout_onNavLoad = function(e) { // {{{1
		// Next button {{{2
		var isExplorer = document.evaluate("//text()[contains(.,'Classification: Explorer') or contains(.,'Classification: Sentry') or contains(.,'Classification: Probe Rush')]", document, null, XPathResult.BOOLEAN_TYPE, null).booleanValue;
		//GM_log(isExplorer);

		var formIter = document.evaluate("//form[@name='form2']", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var formNode = formIter.iterateNext();

		var localLocs, llSelect, locIndex;
		if (formNode)
		{
			localLocs = document.evaluate("//select[@name='tworld2']", formNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

			llSelect = localLocs.iterateNext();
		} else {
			formNode = document; // suppress error messages due to bad code structuring
		}
		locIndex = 1;

		if(llSelect) {
			var curPos = document.evaluate("//td[(child::text() = 'Fleet Position:')]/following-sibling::node()[position()=2]/child::node()", formNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

			while( cNode = curPos.iterateNext() )
			{
				if(cNode.textContent.match(/^\s+$/)) continue;

				for(i = 0; i < llSelect.options.length; i++) {
					if(cNode.textContent.indexOf(llSelect.options[i].text)==0) {
						locIndex = i;
						break;
					}
				}
				break;
			}
		}

		// back 2 pages for open->set dest->launch. doesn't work so well for open->about->set dest->launch though
		var inTransit = document.evaluate("//b[text()='In Transit']", formNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var bNode = inTransit.iterateNext();
		if (bNode) {
			bNode.setAttribute("onclick","history.go(-2);");
			bNode.style.cursor = 'pointer';
		}

		var curCoord = document.evaluate("//td[(child::text() = 'Fleet Coordinates:')]/following-sibling::node()/a[contains(text(),'global')]", formNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var cNode = curCoord.iterateNext();
		var newHref;
		if (cNode) {
			//GM_log("coord '"+cNode.href+"' "+cNode.textContent+" name:"+cNode.nodeName+" value:"+cNode.nodeValue);
			var z = Number(cNode.href.match("z=(-?[0-9]+)")[1]);

			/* Extra z-offset */
			newHref = cNode.href.replace(z, z + 6000);
			//GM_log(newHref);

			var ws1 = document.createTextNode(" ");

			var newA = document.createElement("a");
			newA.setAttribute("href", newHref);
			var aText = document.createTextNode("^^^");
			newA.appendChild(aText);

			var parent = cNode.parentNode;
			var after = cNode.nextSibling;

			parent.insertBefore(ws1, after);
			parent.insertBefore(newA, after);
		}

		if(llSelect && isExplorer) {
			//if (locIndex) llSelect.selectedIndex = locIndex;
			var nextBtn = document.createElement("input");
			nextBtn.setAttribute("type","button");
			if(locIndex < llSelect.options.length - 1) {
				nextBtn.setAttribute("value","[N]ext");
				nextBtn.setAttribute("accesskey","n");
				nextBtn.setAttribute("id","scoutnext");
				//Edit
				//nextBtn.setAttribute("onclick","this.previousSibling.selectedIndex = "+(locIndex+1)+"; this.form.submit();");
				nextBtn.setAttribute("onclick","this.previousSibling.selectedIndex = "+(locIndex+1)+"; GM_WF_QuickLaunch_qlworld();");
			} else {
				nextBtn.setAttribute("value","Done");
				nextBtn.setAttribute("class","warn");
				nextBtn.setAttribute("id","scoutdone");
				nextBtn.setAttribute("onclick",newHref.replace("^javascript:",""));
			}
			llSelect.parentNode.appendChild(nextBtn);
	        //nextBtn.click();//automaticly clicks the button that appears once you load the page
		}
		// }}}2
	}

	if(window.location.href.indexOf('/fleet_navigation') != -1) {
		window.addEventListener("load", window.GM_wfscout_onNavLoad, false);
	}
}

//
function viewWorld()
{
	//
}

//
function nextExplorer()
{
	// Version 1.0 = Original version by apache?
	// Version 1.1 = small fixes and improvements for Firefox 3.5+ (by Seko)
	// Version 1.2 = fixed for H6 (by Seko)
	// Version 1.3 = fixed for H7 on FF12 and Chrome (by Seko)

	// Comma separated list of Explorers/Outcast Explorers ids to exclude from rotation
	// Example: [3183,3184,3200]
	var excludeFleets = [];

	//Defines string function
	String.prototype.endsWith = function(str){return (this.match(str+"$")==str)}

	//Instance location / base / hostname
	var base = window.location.href;
	var instance = base.substring(base.indexOf("//") + 2);
	instance = instance.substring(0, instance.indexOf("."));

	//Get fleet ID
	var fleetID = parseFleetId(window.location.href);

	var isExplorer = false;
	var excludeThis = false;

	//Return elements specified by XPath
	function path(p, context) {
		if (!context) context = document;
		var i, arr = [], xpr = document.evaluate(p, context, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (i = 0; item = xpr.snapshotItem(i); i++) arr.push(item);
		return arr;
	}

	//Parses fleetId out of URL/args
	function parseFleetId(str) {
	  var res = str.match(/fleet=(\d+)/);
	  return res ? res[1] : res;
	}

	//Function used to filter out fleets on a mission
	function killActive(element, index, array) {
		if(parseFleetId(element.href) == fleetID){
			//alert("You are an intrepid explorer.");
			isExplorer = true;
		}
		for(var i = 0; i < excludeFleets.length; i++){
			if(parseFleetId(element.href) == excludeFleets[i]){
				var excludeThis = true;
			}
		}
		// we suppose that explorer already on the way has style.color set to something (ie is Active)
		if(element.style.color || excludeThis) {
			excludeThis = false;
			return false;
		}else{
			return true;
		}
	}

	var fleetList = path("//li[@id='class-258']/a");
	fleetList.concat(path("//li[@id='class-399']/a"));
	GM_log("fleetList.size before filter: " + fleetList.length);
	fleetList = fleetList.filter(killActive);
	GM_log("fleetList.size after filter: " + fleetList.length);
	var ships = [];
	for(var i = 0; i < fleetList.length; i++){
		ships[i] = parseInt(parseFleetId(fleetList[i].href));
	}
	GM_log("ships.size: " + ships.length);
	if(ships[0] != undefined && isExplorer){
		var launchcheck = document.evaluate("//p/text()[contains(.,'Fleet Launched!')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if(launchcheck != null && !window.location.href.endsWith('fx=1')){
			window.location.href = 'http://' + instance + '.war-facts.com/fleet_navigation.php?fleet=' + ships[0];
		}
	}
}

tonnage();
autoScan();
quickLaunch();
scoutHelper();
nextExplorer();