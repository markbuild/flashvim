if (navigator.userAgent.includes("Firefox")) { // 兼容Firefox
    chrome = browser;
} 
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: chrome.extension.getURL('options/index.html') });
});
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    switch(request.type) {
        case 'closeCurrentTab':
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                const current = tabs[0]
                chrome.tabs.remove(current.id) // Remove current tab
            })
            break
        case 'closeAllTab':
            chrome.tabs.query({}, tabs => {
                for (let i = 0; i < tabs.length; i++) {
                    chrome.tabs.remove(tabs[i].id)
                }
            });
            break;
        case 'tabm':
            var _num = +request.tabIndex
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                var current = tabs[0],
                    currentTabId = current.id,
                    currentIndex = current.index
                if(currentIndex < _num) _num--
                chrome.tabs.move(currentTabId, {index: _num })
            })
            break;
        case 'changetab':
            updateAllTabs()
            var _index,_num,_direction
            if (request.num) { 
                _num = request.num
            } else if(request.direction) {
                _direction= request.direction
            }
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                var current = tabs[0],
                    tabId = current.id,
                    currentIndex = current.index
                chrome.tabs.query({currentWindow: true}, tabs => {
                    if(_num) 
                        _index = _num-1
                    else
                        _index = (currentIndex +_direction) % tabs.length;
                    chrome.tabs.query({index: _index}, function(tabs){
                        if (tabs.length) {
                            var tabToActivate = tabs[0],
                                tabToActivate_Id = tabToActivate.id
                            chrome.tabs.update(tabToActivate_Id, { active: true })
                        }
                    });
                });
            });
            break;
        case 'getlink':
            var v = getlinkmap()
            typeof v === 'object' ?  sendResponse(getlinkmap()[request.cmd][0]) : sendResponse(getlinkmap()[request.cmd]) // 兼容之前的字符串
            break;
        case 'getlinkmap':
            sendResponse(getlinkmap())
            break;
        case 'setlinkmap':
            if (!request.linkmap) return false
            localStorage.setItem('linkmap', JSON.stringify(request.linkmap));
            sendResponse(JSON.parse(localStorage.getItem('linkmap')));
            if(localStorage.getItem('synurl')){ // 异步任务
                sync_write();
            }
            break;
        case 'getscriptset':
            sendResponse(getscriptset())
            break;
        case 'setscriptset':
            if (!request.scriptset) return false
            localStorage.setItem('scriptset', JSON.stringify(request.scriptset));
            sendResponse(JSON.parse(localStorage.getItem('scriptset')));
            if(localStorage.getItem('synurl')){ // 异步任务
                sync_write();
            }
            break;
        case 'getpatterns':
            sendResponse(getpatterns())
            break;
        case 'setpatterns':
            if (!request.patterns) return false
            localStorage.setItem('patterns', JSON.stringify(request.patterns))
            sendResponse(JSON.parse(localStorage.getItem('patterns')))
            if(localStorage.getItem('synurl')) { // 异步任务
                sync_write();
            }
            break;
        case 'saveSynInfo':
            const doSomethingWith = async () => {
                return await sync_read((_res) => {
                    localStorage.setItem('linkmap', JSON.stringify(_res.linkmap))
                    localStorage.setItem('scriptset', JSON.stringify(_res.scriptset))
                    localStorage.setItem('patterns', JSON.stringify(_res.patterns))
                })
            }
            let synurl = request.synurl
            let synusername = request.synusername
            let synpassword = request.synpassword
            localStorage.setItem('synurl', synurl)
            localStorage.setItem('synusername', synusername)
            localStorage.setItem('synpassword', synpassword)
            localStorage.setItem('syntime', parseInt(new Date().getTime()/1000))
            doSomethingWith().then(sendResponse({success: 1}))
            break;
        case 'getSynInfo':
            if(localStorage.getItem('synurl')){
                sendResponse({success: 1, synurl: localStorage.getItem('synurl'), synusername: localStorage.getItem('synusername'), synpassword: localStorage.getItem('synpassword'), syntime: localStorage.getItem('syntime')})
            } else {
                sendResponse({success: 0 })
            }
            break

    }
})

const getlinkmap = () => {
    if(!localStorage.getItem('linkmap')) { // Init Setting
        localStorage.setItem('linkmap', JSON.stringify({
            "gh":["https://github.com", ""],
            "gg":["https://www.google.com/", ""],
            "tt":["https://twitter.com/", ""],
            "fv":["https://h.markbuild.com/flashvim.html", ""],
            "w3v": ["https://validator.w3.org/nu/?doc={$url}", ""]
        }))
    }
    return JSON.parse(localStorage.getItem('linkmap'))
}
const getscriptset = () => {
    if(!localStorage.getItem('scriptset')) { // Init Setting
        localStorage.setItem('scriptset', JSON.stringify([]))
    }
    return JSON.parse(localStorage.getItem('scriptset'))
}

const getpatterns = () => {
    if(!localStorage.getItem('patterns')) { // Init Setting
        localStorage.setItem('patterns', JSON.stringify({
            "prev":"prev, <, ‹, ←, «, <<, 上一页, 前页",
            "next":"next, >, ›, →, », >>, 下一页, 后页",
            "search":"search, kw, keyword, 搜索",
            "save":"save, update, 保存"
        }));
    }
    return JSON.parse(localStorage.getItem('patterns'))
}

/***
  ++++++++++++++++++++++++++++++++
  +++     2015 tabnumber       +++
  ++++++++++++++++++++++++++++++++
  */
const updatetab = details => {
    if(!details.url) return
    if(!details.url.startsWith('http') && !details.url.startsWith('file')) return;
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
    chrome.tabs.executeScript(id, {code : "document.title = '" + title + "';"}, _ =>{ let e = chrome.runtime.lastError; if(e !== undefined) console.log(id, e) });
};
const transformnumber = n => {
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
const updateAllTabs = _ => {
    chrome.tabs.query({}, tabs => {
        for (var i = 0; i < tabs.length; i++) {
            updatetab(tabs[i]);
        }
    });
    return true;
}
chrome.tabs.onCreated.addListener(Id => {
    updateAllTabs()
});
chrome.tabs.onUpdated.addListener((Id, changeInfo, tab) => {
    updateAllTabs()
});
chrome.tabs.onActivated.addListener(Id => {
    updateAllTabs();
});
chrome.tabs.onMoved.addListener(Id => {
    updateAllTabs();
});
chrome.tabs.onRemoved.addListener(Id => {
    updateAllTabs();
});




var Base64 = {
    encode : function (input) {
        return btoa(unescape(encodeURIComponent(input)))
    }
}

const sync_read = _callback => {
    let username = localStorage.getItem('synusername');
    let password = localStorage.getItem('synpassword');
    let url = localStorage.getItem('synurl');
    let auth_header = 'Basic ' + Base64.encode(username + ':' +password);
    fetch(url, {
        method: 'GET',
        headers: new Headers({
            "Authorization": auth_header
        }),
        credentials: "same-origin"
    }).then(response => response.json()).then(myJson => {
        _callback(myJson);
    }).catch(error => console.log(error));
}
const sync_write = _=> {
    let linkmap = JSON.parse(localStorage.getItem('linkmap'))
    let scriptset = JSON.parse(localStorage.getItem('scriptset'))
    let patterns = JSON.parse(localStorage.getItem('patterns'))
    let str = JSON.stringify({linkmap: linkmap, scriptset: scriptset, patterns: patterns});
    let username = localStorage.getItem('synusername');
    let password = localStorage.getItem('synpassword');
    let url = localStorage.getItem('synurl');
    let auth_header = 'Basic ' + Base64.encode(username + ':' +password);
    fetch(url, {
        method: 'PUT',
        body: str,
        headers: new Headers({
            "Authorization": auth_header
        }),
        credentials: "same-origin"
    }).then(response => {})
}
setInterval(function () {
    if(localStorage.getItem('synurl')) {
        var time = parseInt(new Date().getTime()/1000)
        var last_syn_time = localStorage.getItem('syntime')
        if(time - last_syn_time > 300){ // Synchronisation interval: 5 minutes
            sync_read(function(_res) {
                localStorage.setItem('linkmap', JSON.stringify(_res.linkmap))
                localStorage.setItem('scriptset', JSON.stringify(_res.scriptset))
                localStorage.setItem('patterns', JSON.stringify(_res.patterns))
                localStorage.setItem('syntime', parseInt(new Date().getTime()/1000))
            })
        }
    }
},60000); // 1 minutes
