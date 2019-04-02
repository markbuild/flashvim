var linkmap = {};
var patterns = {};

chrome.runtime.sendMessage({type:'getlinkmap'},function (response) {
    linkmap = response;
    render_link_map_table();
});
chrome.runtime.sendMessage({type:'getpatterns'},function (response) {
    patterns = response;
    render_patterns_table();
});

document.getElementById("add_new_map").addEventListener('click', (event) => { add_new_map() }, false );
document.getElementById("save_linkmap").addEventListener('click', (event) => { save_linkmap() }, false );
document.getElementById("reset_linkmap").addEventListener('click', (event) => { reset_linkmap() }, false );
document.getElementById("save_patterns").addEventListener('click', (event) => { save_patterns() }, false );
document.getElementById("reset_patterns").addEventListener('click', (event) => { reset_patterns() }, false );
document.getElementById("uploadbackupfile").addEventListener('change', (event) => {loadfile(event.target)}, false );
document.getElementById("savesyninfo").addEventListener('click', (event) => {savesyninfo()}, false );

const render_link_map_table = () => {
    var html='<tr><th>Key</th><th>Link</th></tr>';
    Object.keys(linkmap).sort().forEach(function(key) {
        html+='<tr><td class="key"><input value="'+key+'" /></td><td class="link"><input value="'+linkmap[key]+'" /></td><td><button class="remove">x</button></td></tr>';
    });

    document.getElementById("linkmapedit").innerHTML=html;
    for(let i = 0; i < document.getElementsByClassName("remove").length; i++){
        document.getElementsByClassName("remove")[i].addEventListener('click', (event) => { removecurrentline(event) }, false );
    }
    update_backup_link();
};
const render_patterns_table = () => {
    document.getElementById("prev_patterns").value = patterns.prev;
    document.getElementById("next_patterns").value = patterns.next;
    update_backup_link();
};

const update_backup_link = () => {
    const options={linkmap:linkmap, patterns:patterns};
    const str = JSON.stringify(options);
    const blob = new Blob([str], {type: "text/json,charset=UTF-8"});
    const elem = document.getElementById("downloadbackup");
    elem.href = URL.createObjectURL(blob);
    elem.download = "flashvim_database.bak";
};

const loadfile = (event_this) => {
    var file = event_this.files[0];
    var reader = new FileReader();
    reader.onload = function() {
        var options = JSON.parse(reader.result); 
        chrome.runtime.sendMessage({type:'setlinkmap',linkmap:options.linkmap},function (response) {
            linkmap = response;
            render_link_map_table();
        });
        chrome.runtime.sendMessage({type:'setpatterns',linkmap:options.patterns},function (response) {
            patterns = response;
            render_patterns_table();
        });
    };
    reader.readAsText(file);
};

const add_new_map = () => {
    let tr = document.createElement('tr')
    tr.className="new"
    tr.innerHTML+='<td class="key"><input></td><td class="link"><input></td><td><button class="remove">x</button></td>';
    document.getElementById("linkmapedit").appendChild(tr);
    for(let i = 0; i < document.getElementsByClassName("remove").length; i++){
        document.getElementsByClassName("remove")[i].addEventListener('click', (event) => { removecurrentline(event) }, false );
    }
};

const removecurrentline = (event) => {
    event.target.parentElement.parentElement.remove();
};
const reset_linkmap = () => {
    render_link_map_table();
}
const save_linkmap = () => {
    var elems = document.getElementById("linkmapedit").getElementsByTagName("input");
    var arr={}
    for(var i=0;i< elems.length;i++){
        var value= elems[i].value;
        if(!value) {
            alert('You data is not valid');
            return;
        }
        if(i%2==1) {
            arr[elems[i-1].value]=elems[i].value;
        }
    }
    linkmap = {};
    Object.keys(arr).sort().forEach(function(key) {
        linkmap[key] = arr[key];
    });
    chrome.runtime.sendMessage({type:'setlinkmap',linkmap:linkmap},function (response) {
        render_link_map_table();
    });
};
const reset_patterns = () => {
    render_patterns_table();
}
const save_patterns= () => {
    patterns = {"prev":document.getElementById("prev_patterns").value.toLocaleLowerCase(), "next":document.getElementById("next_patterns").value.toLocaleLowerCase()}
    chrome.runtime.sendMessage({type:'setpatterns', patterns:patterns},function (response) {
        render_patterns_table();
    });
};

const savesyninfo = _=> {
    var synurl = document.getElementById("synurl").value;
    var synusername = document.getElementById("synusername").value;
    var synpassword = document.getElementById("synpassword").value;
    if(synurl && synusername && synpassword) {
        chrome.runtime.sendMessage({type:'saveSynInfo', synurl: synurl, synusername: synusername, synpassword: synpassword},function (response) {
            if(response.success == 1){
                alert('Synchronized successful')
            }
        });
    } else {
        alert('Please put the URL, the Username and Password')
    }
}
function formatdate(_timestamp) {
    var date = new Date(+_timestamp),
        y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        i = date.getMinutes(),
        s = date.getSeconds();
    m = m > 9? m : "0"+m;
    d = d > 9? d: "0"+d;
    h = h > 9? h: "0"+h;
    i = i > 9? i: "0"+i;
    s = s > 9? s: "0"+s;
    return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
}

chrome.runtime.sendMessage({type:'getSynInfo'},function (response) {
    if(response.success == 1) {
        document.getElementById("synurl").value = response.synurl;
        document.getElementById("synusername").value = response.synusername;
        document.getElementById("synpassword").value = response.synpassword;
        document.getElementById("last_syn_time").innerText = '(Last sync time: ' + formatdate(1000 * response.syntime) + ')';
    }
})
