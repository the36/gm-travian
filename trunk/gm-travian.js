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

function checkIdleScouts(todo, units) {
    var extra = units.getCount('Equites Legati') - 1;
    if (extra > 0) {
	todo.add(new ToDoListItem('use your ' + extra + ' extra scouts'));
    }
}

function ToDoListItem(html) {
    this.html = html;
    this.render = function() {
	return "<tr><td>" + html + "</td></tr>";
    }
}

function ToDoList() {
    this.list = [];
    this.add = function(x) {
	this.list = this.list.concat([x]);
    }
    this.render = function() {
	var i, out = "<div class='f10 b'>To Do:</div><table width='100%' class='f10'>";
	if (this.list.length == 0) {
	    out += "<tr><td>&lt;EMPTY&gt;</td></tr>";
	} else {
	    for(i=0; i<this.list.length; i++) {
		out += this.list[i].render();
	    }
	}
	out += "</table>";
	return out;
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

var resources = new Resources(),
    production = new Production(),
    villageName = new VillageName(),
    units = new Units(),
    todo = new ToDoList();

function parseUpdates() {
    resources.refresh();
    production.refresh();
    villageName.refresh();
    units.refresh();
}

function calculateToDoList() {
    checkIdleScouts(todo, units);
}

parseUpdates();
calculateToDoList();
insertMessageDiv(todo.render());
