// measure of current resource stockpiles
function Resources() {
    this.className = 'Resources';
    this.resourceNames = ['wood','clay','iron','wheat'];
    this.wood = GM_getValue(this.className + '.wood',0);
    this.clay = GM_getValue(this.className + '.clay',0);
    this.iron = GM_getValue(this.className + '.iron',0);
    this.wheat = GM_getValue(this.className + '.wheat',0);
    this.setWood = function(n) { 
	this.wood = n; GM_setValue(this.className + '.wood', n);
    }
    this.setClay = function(n) { 
	this.clay = n; GM_setValue(this.className + '.clay', n);
    }
    this.setIron = function(n) { 
	this.iron = n; GM_setValue(this.className + '.iron', n);
    }
    this.setWheat = function(n) { 
	this.wheat = n; GM_setValue(this.className + '.wheat', n);
    }
    this.refresh = function() {
	var resDiv = document.getElementById('lres0'),
	    tds = (resDiv != null) ? resDiv.getElementsByTagName('td') : [];
	if (tds.length > 0) {
	    this.setWood(parseInt(tds[1].innerHTML.split('/')[0]));
	    this.setClay(parseInt(tds[3].innerHTML.split('/')[0]));
	    this.setIron(parseInt(tds[5].innerHTML.split('/')[0]));
	    this.setWheat(parseInt(tds[7].innerHTML.split('/')[0]));
	}
    }
}

function Production() {
    this.inheritFrom = Resources;
    this.className = 'Production';
    this.inheritFrom();
    this.refresh = function() {
	var lrprDiv = document.getElementById('lrpr'),
	    tds = (lrprDiv != null) ? lrprDiv.getElementsByTagName('td') : [];
	if (tds.length == 0) return;
	this.setWood(parseInt(tds[2].getElementsByTagName('b')[0].innerHTML));
	this.setClay(parseInt(tds[6].getElementsByTagName('b')[0].innerHTML));
	this.setIron(parseInt(tds[10].getElementsByTagName('b')[0].innerHTML));
	this.setWheat(parseInt(tds[14].getElementsByTagName('b')[0].innerHTML));
    }
    this.waitTimeHours = function(res, target) {
	var hrs, out = 0;
	if (res.wood < target.wood) {
	    hrs = (target.wood - res.wood) * 1.0 / this.wood;
	    out = (hrs > out) ? hrs: out;
	}
	if (res.clay < target.clay) {
	    hrs = (target.clay - res.clay) * 1.0 / this.clay;
	    out = (hrs > out) ? hrs: out;
	}
	if (res.iron < target.iron) {
	    hrs = (target.iron - res.iron) * 1.0 / this.iron;
	    out = (hrs > out) ? hrs: out;
	}
	if (res.wheat < target.wheat) {
	    hrs = (target.wheat - res.wheat) * 1.0 / this.wheat;
	    out = (hrs > out) ? hrs: out;
	}
	return out;
    }
}

function VillageName() {
    this.name = GM_getValue('VillageName');
    this.refresh = function() {
	var lmid2Div = document.getElementById('lmid2');
	if (lmid2Div == null) return;
	this.name = lmid2Div.getElementsByTagName('h1')[0].innerHTML;
	GM_setValue('VillageName',this.name);
    }
}

function Units() {
    this.counts = JSON.parse(GM_getValue('Units','{}'));
    this.typeMap = { 'Praetorian' : 'http://s8.travian.us/img/un/u/2.gif',
    		     'Imperian' : 'http://s8.travian.us/img/un/u/3.gif',
    		     'Equites Legati' : 'http://s8.travian.us/img/un/u/4.gif' };
    this.marshal = function() {
	return JSON.stringify(this.counts);
    }
    this.getCount = function(nm) { 
    	return (this.typeMap[nm] && this.counts[this.typeMap[nm]]) 
	    ? this.counts[this.typeMap[nm]] : 0;
    }
    this.refresh = function() {
    	var i, tname, tnum, tr, ltrmDiv = document.getElementById('ltrm');
    	if (ltrmDiv == null) return;
    	for(i=0; i<ltrmDiv.getElementsByTagName('tr').length; i++) {
    	    tr = ltrmDiv.getElementsByTagName('tr')[i];
    	    tnum = parseInt(tr.getElementsByTagName('b')[0].innerHTML);
    	    tname = tr.getElementsByTagName('img')[0].src;
    	    this.counts[tname] = tnum;
    	}
	GM_setValue('Units',this.marshal());
    }
}

function timeAdd(d, hrs) {
    var out = new Date();
    out.setTime(d.getTime() + hrs * 60 * 60 * 1000);
    return out;
}

function formatDate(d) {
    var dayMillis = 24 * 60 * 60 * 1000,
	now = new Date(),
	deltaDays = parseInt((d.getTime() - now.getTime())/dayMillis),
	out = '';
    if (d.getHours() == 0) { out += '12'; }
    else if (d.getHours() > 12) { out += '' + (d.getHours() - 12); }
    else { out += '' + d.getHours(); }
    out += ':' + ((d.getMinutes() < 10) ? '0' : '') + d.getMinutes();
    out += (d.getHours() < 12) ? 'am' : 'pm';
    if (deltaDays > 0) {
	out += ' (+' + deltaDays + ' day' + ((deltaDays > 1) ? 's' : '') + ')';
    }
    return out;
}

function parseResourceTarget(resTable) {
    var imgs = resTable.getElementsByTagName('img'),
	out = new Resources();
    out.wood = parseInt(imgs[0].nextSibling.nodeValue);
    out.clay = parseInt(imgs[1].nextSibling.nodeValue);
    out.iron = parseInt(imgs[2].nextSibling.nodeValue);
    out.wheat = parseInt(imgs[3].nextSibling.nodeValue);
    return out;
}

function updateResourceWaitTimes(res, prod) {
    var i, when, hrs, target,
	spans = document.getElementsByTagName('span');
    for(i=0; i<spans.length; i++) {
	if (spans[i].getAttribute('class') == 'c'
	    && spans[i].innerHTML == 'Too few resources') {
	    target = parseResourceTarget(spans[i].parentNode);
	    hrs = prod.waitTimeHours(res, target);
	    when = timeAdd(new Date(), hrs);
	    spans[i].innerHTML = '(Ready at ' + formatDate(when) + ')';
	    spans[i].setAttribute('class','');
	}
    }
}

function insertMessageDiv(html) {
    var lmid2Div = document.getElementById('lmid2'),
	anonDiv = lmid2Div.getElementsByTagName('div')[2],
	lbau1Div = document.getElementById('lbau1'),
	newDiv = document.createElement('div');
    if (lbau1Div == null) {
	lbau1Div = document.createElement('div');
	lbau1Div.id = 'lbau1';
	anonDiv.appendChild(lbau1Div);
    }
    newDiv.innerHTML = html;
    lbau1Div.appendChild(newDiv);
}

function previousTag(t) {
    var n = t;
    do n = n.previousSibling;
    while (n && n.nodeType != 1);
    return n;
}

function nextTag(t) {
    var n = t;
    do n = n.nextSibling;
    while (n && n.nodeType != 1);
    return n;
}

function popup(html) {
    var popupDiv = document.getElementById('ce');
    if (popupDiv == null) {
	popupDiv = document.createElement('div');
	popupDiv.id = 'ce';
	document.getElementsByTagName('body')[0].appendChild(popupDiv);
    }
    popupDiv.innerHTML = '<div class="popup3">' + html + '</div><a href="#" onClick="Close(); return false;"><img src="img/un/a/x.gif" border="1" class="popup4" alt="Close"></a>';
}

function popupMenu() {
    var menuHTML = '<div id="gmt-menu"/>' +
	'<a id="gmt-menu-scouting" href="#">Scouting</a>' +
	'</div>' +
	'<div id="gmt-menu-pane">' +
	'</div>';
    popup(menuHTML);
}

function addMenuLink() {
    var oldHTML, ltimeDiv = document.getElementById('ltime');
    if (ltimeDiv == null) return;
    oldHTML = ltimeDiv.innerHTML;
    ltimeDiv.innerHTML = '<table><tr><td>' + oldHTML + '</td><td><a id="gmt-menu-link" href="#">[GMT]</a></td></tr></table>';
    document.getElementById('gmt-menu-link').addEventListener('click', function () { popupMenu(); }, true);
}

var resources = new Resources(),
    production = new Production(),
    villageName = new VillageName(),
    units = new Units();

function parseUpdates() {
    resources.refresh();
    production.refresh();
    villageName.refresh();
    units.refresh();
}

addMenuLink();
parseUpdates();
updateResourceWaitTimes(resources, production);
