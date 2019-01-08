var linkmap = {};

chrome.runtime.sendMessage({type:'getlinkmap'},function (response) {
    console.log(response);
    linkmap = response;
    render_link_map_table();
});

document.getElementById("uploadbackupfile").addEventListener('change', (event) => {loadfile(event.target)}, false );

document.getElementById("add_new_map").addEventListener('click', (event) => { add_new_map() }, false );
document.getElementById("save_linkmap").addEventListener('click', (event) => { save_linkmap() }, false );

const render_link_map_table = () => {
    var html='<tr><th>Key</th><th>Link</th></tr>';
    Object.keys(linkmap).sort().forEach(function(key) {
        html+='<tr><td class="key"><input value="'+key+'" /></td><td class="link"><input value="'+linkmap[key]+'" /></td></tr>';
    });

    document.getElementById("linkmaptable").innerHTML=html;
    update_backup_link();
};

const update_backup_link = () => {
    const options={linkmap:linkmap};
    const str = JSON.stringify(options);
    const blob = new Blob([str], {type: "text/json,charset=UTF-8"});
    const elem = document.getElementById("downloadbackup");
    elem.href = URL.createObjectURL(blob);
    elem.download = "flash_vim_options" + parseInt(new Date().getTime()/1000) +".bak";
};

const loadfile = (event_this) => {
    var file = event_this.files[0];
    var reader = new FileReader();
    reader.onload = function() {
        var options = JSON.parse(reader.result); 
        chrome.runtime.sendMessage({type:'setlinkmap',linkmap:options.linkmap},function (response) {
        });
    };
    reader.readAsBinaryString(file);
};

const add_new_map = () => {
    document.getElementById("linkmaptable").innerHTML+='<tr class="new"><td class="key"><input></td><td class="link"><input></td></tr>';
};

const save_linkmap = () => {
    var elems = document.getElementById("linkmaptable").getElementsByTagName("input");
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
