chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    /***
      +++++++++++++++++++++++++++
      +++    for vim style gt     +++
      +++++++++++++++++++++++++++
      */
    if(request.cmd=='removecurrenttab'){
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const current = tabs[0]
            //alert(current.id)
            //alert(current.index)
            chrome.tabs.remove(current.id);//Remove current tab
        });
    } else if(request.cmd=='changetab'){
        updateAllTabs();
        var _index,_num,_direction;
        if(request.num){ 
            _num = request.num; 
        } else if(request.direction){ 
            _direction= request.direction;
        }
        chrome.tabs.query({active: true,currentWindow: true}, (tabs) => {
            var current = tabs[0],
                tabId = current.id,
                currentIndex = current.index;
            chrome.tabs.query({currentWindow: true}, (tabs) => {
                if(_num) 
                    _index = _num-1;
                else
                    _index = (currentIndex+_direction) % tabs.length;
                chrome.tabs.query({index: _index}, function(tabs){
                    if (tabs.length) {
                        var tabToActivate = tabs[0],
                            tabToActivate_Id = tabToActivate.id;
                        chrome.tabs.update(tabToActivate_Id, {active: true});
                    }
                });
            });
        });
    };
});
/***
  ++++++++++++++++++++++++++++++++
  +++     2015 tabnumber       +++
  ++++++++++++++++++++++++++++++++
  */
const updatetab = (details) => {
    if(details.url.startsWith('chrome://')) return;
    if(details.url.startsWith('about:')) return;
    if(details.url.startsWith('file:///')) return;
    var id = details.id
        ,index = details.index
        ,title = details.title;
    if (title.indexOf(' - ') == 1) {
        title = title.substr(4);
    }
    if (title.indexOf(' - ') == 2) {
        title = title.substr(5);
    }
    title = transformnumber(index + 1) + ' - ' + title;
    try {
        chrome.tabs.executeScript(id, {code : "document.title = '" + title + "';"});
    } catch(e) {
        alert(e);
    }
};
const transformnumber = (n) => {
    switch (n){
        case 1: return '❶';break;
        case 2: return '❷';break;
        case 3: return '❸';break;
        case 4: return '❹';break;
        case 5: return '❺';break;
        case 6: return '❻';break;
        case 7: return '❼';break;
        case 8: return '❽';break;
        case 9: return '❾';break;
        case 10:return '❿';break;
        default:return n;
    }
}
const updateAllTabs = () => {
    chrome.tabs.query({}, (tabs) => {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            updatetab(tab);
        }
    });
    return true;
}
chrome.tabs.onCreated.addListener((Id) => {
    updateAllTabs();
    updateFlag(Id);
});
chrome.tabs.onUpdated.addListener((Id, changeInfo, tab) => {
    updateAllTabs();
});
chrome.tabs.onSelectionChanged.addListener((Id) => {
    updateAllTabs();
});
chrome.tabs.onMoved.addListener((Id) => {
    updateAllTabs();
});
chrome.tabs.onRemoved.addListener((Id) => {
    updateAllTabs();
});
