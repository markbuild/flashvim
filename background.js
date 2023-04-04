if (navigator.userAgent.includes("Firefox")) { // 兼容Firefox
    chrome = browser;
} 
chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.create({
    url: chrome.runtime.getURL("options/index.html"),
    active: true
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(request => {
    const type = request.type
    switch(type) {
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
            })
            break
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
            getlinkmap(function(_res) {
                port.postMessage({ link: _res[request.cmd][0], type  })
            })
            break;
        case 'getlinkmap':
            getlinkmap(function(_res) {
                port.postMessage({ linkmap: _res, type  })
            })
            break
        case 'getscriptset':
            getscriptset(function(_res) {
                port.postMessage({ scriptset: _res, type  })
            })
            break
        case 'getpatterns':
            getpatterns(function(_res) {
                port.postMessage({ patterns: _res, type  })
            })
            break
        case 'setlinkmap':
            if (!request.linkmap) return false
            chrome.storage.local.set({
                linkmap: JSON.stringify(request.linkmap)
            }, function() {
                chrome.storage.local.get(['synurl'], function(result) {
                    if (result.synurl) {
                      sync_write();
                    }
                    port.postMessage({ linkmap: request.linkmap, type })
                })
            })
            break
        case 'setscriptset':
            if (!request.scriptset) return false
            chrome.storage.local.set({
                scriptset: JSON.stringify(request.scriptset)
            }, function() {
                chrome.storage.local.get(['synurl'], function(result) {
                    if (result.synurl) {
                      sync_write();
                    }
                    port.postMessage({ scriptset: request.scriptset, type })
                })
            })
            break
        case 'setpatterns':
            if (!request.patterns) return false
            chrome.storage.local.set({
                patterns: JSON.stringify(request.patterns)
            }, function() {
                chrome.storage.local.get(['synurl'], function(result) {
                    if (result.synurl) {
                      sync_write();
                    }
                    port.postMessage({ patterns: request.patterns, type })
                })
            })
            break
        case 'saveSynInfo':
            chrome.storage.local.set({
                synurl: request.synurl,
                synusername: request.synusername,
                synpassword: request.synpassword,
                syntime: parseInt(new Date().getTime()/1000)
            }, function() {
                sync_read(_res => {
                    chrome.storage.local.set({
                      linkmap: JSON.stringify(_res.linkmap),
                      scriptset: JSON.stringify(_res.scriptset),
                      patterns: JSON.stringify(_res.patterns),
                    }, function() {
                        port.postMessage({ success: 1, type })
                    })
                })
            })
            break
        case 'getSynInfo':
            chrome.storage.local.get(['synurl', 'synusername', 'synpassword', 'syntime'], function(result) {
                if (result.synurl) {
                    port.postMessage({ success: 1, synurl: result.synurl, synusername: result.synusername, synpassword: result.synpassword, syntime: result.syntime, type })
                } else {
                    port.postMessage({ success: 0, type })
                }
            })
            break

    }
  })
})

const getlinkmap = _callback => {
    chrome.storage.local.get(['linkmap'], function(result) {
        if (!result.linkmap) {
            const linkmap = JSON.stringify({
                "gh":["https://github.com", ""],
                "gg":["https://www.google.com/", ""],
                "tt":["https://twitter.com/", ""],
                "fv":["https://h.markbuild.com/flashvim.html", ""],
                "w3v": ["https://validator.w3.org/nu/?doc={$url}", ""]
            })
            chrome.storage.local.set({
                linkmap
            }, function() {
                _callback(JSON.parse(linkmap))
            })
        } else {
            _callback(JSON.parse(result.linkmap))
        }
    })
}
const getscriptset = _callback => {
    chrome.storage.local.get(['scriptset'], function(result) {
        if (!result.scriptset) {
            const scriptset = JSON.stringify([])
            chrome.storage.local.set({
                scriptset
            }, function() {
                _callback(JSON.parse(scriptset))
            })
        } else {
            _callback(JSON.parse(result.scriptset))
        }
    })
}

const getpatterns = _callback => {
    chrome.storage.local.get(['patterns'], function(result) {
        if (!result.patterns) {
            const patterns = JSON.stringify({
                "prev":"prev, <, ‹, ←, «, <<, 上一页, 前页",
                "next":"next, >, ›, →, », >>, 下一页, 后页",
                "search":"search, kw, keyword, 搜索",
                "save":"save, update, 保存"
            })
            chrome.storage.local.set({
                patterns
            }, function() {
                _callback(JSON.parse(patterns))
            })
        } else {
            _callback(JSON.parse(result.patterns))
        }
    })
}

var Base64 = {
    encode : function (input) {
        return btoa(unescape(encodeURIComponent(input)))
    }
}

const sync_read = _callback => {
    chrome.storage.local.get(['synusername', 'synpassword', 'synurl'], function(result) {
        let username = result.synusername
        let password = result.synpassword
        let url = result.synurl
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
    })
}
const sync_write = _=> {
    chrome.storage.local.get(['linkmap', 'scriptset', 'patterns', 'synusername', 'synpassword', 'synurl'], function(result) {
        const { linkmap, scriptset, patterns, synusername, synpassword, synurl } = result
        const str = JSON.stringify({ linkmap, scriptset, patterns });
        const auth_header = 'Basic ' + Base64.encode(synusername + ':' + synpassword);
        fetch(url, {
            method: 'PUT',
            body: str,
            headers: new Headers({
                "Authorization": auth_header
            }),
            credentials: "same-origin"
        }).then(response => {})
    })
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "myAlarm") {
    chrome.storage.local.get(['synurl', 'syntime'], function(result) {
        if(result.synurl) {
            var time = parseInt(new Date().getTime()/1000)
            var last_syn_time = result.syntime
            if (time - last_syn_time > 300){ // Synchronisation interval: 5 minutes
                sync_read(function(_res) {
                    chrome.storage.local.set({
                        linkmap: JSON.stringify(_res.linkmap),
                        scriptset: JSON.stringify(_res.scriptset),
                        patterns: JSON.stringify(_res.patterns),
                        syntime: parseInt(new Date().getTime()/1000)
                    })
                })
            }
        }
    })
  }
});
chrome.alarms.create("myAlarm", { delayInMinutes: 6, periodInMinutes: 1 });
