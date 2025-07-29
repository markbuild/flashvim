chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: chrome.runtime.getURL('options/index.html') })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
      })
      break
    case 'tabm':
      let tabIndex = +request.tabIndex
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let current = tabs[0],
        currentTabId = current.id,
        currentIndex = current.index
        if (currentIndex < tabIndex) tabIndex--
        chrome.tabs.move(currentTabId, {index: tabIndex })
      })
      break
    case 'changetab':
      let _index, _num, _direction
      if (request.num) { 
        _num = request.num
      } else if(request.direction) {
        _direction= request.direction
      }
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let current = tabs[0],
        tabId = current.id,
        currentIndex = current.index
        chrome.tabs.query({currentWindow: true}, tabs => {
          if (_num) {
            _index = _num - 1
          } else {
            _index = (currentIndex +_direction) % tabs.length;
          }
          chrome.tabs.query({index: _index}, function(tabs){
            if (tabs.length) {
              let tabToActivate = tabs[0],
              tabToActivate_Id = tabToActivate.id
              chrome.tabs.update(tabToActivate_Id, { active: true })
            }
          })
        })
      })
      break;
    case 'getlink':
      getlinkmap().then(result => {
        typeof result === 'object' ?  sendResponse(result[request.cmd][0]) : sendResponse(result[request.cmd]) // 兼容之前的字符串
      })
            return true;
        case 'getlinkmap':
          getlinkmap().then(result => {
            sendResponse(result)
          })
           return true
        case 'setlinkmap':
            chrome.storage.local.set({ linkmap: request.linkmap }).then()
            chrome.storage.local.get(['synurl']).then(response => {
              if (response.synurl) {
                sync_write();
              }
            })
            sendResponse()
            break;
        case 'getscriptset':
          getscriptset().then(result => {
            sendResponse(result)
          })
          return true
        case 'setscriptset':
            chrome.storage.local.set({ scriptset: request.scriptset }).then(sendResponse)
            chrome.storage.local.get(['synurl']).then(response => {
              if (response.synurl) {
                sync_write();
              }
            })
            break;
        case 'getpatterns':
            getpatterns().then(result => {
              sendResponse(result)
            })
            return true
        case 'setpatterns':
            chrome.storage.local.set({ patterns: request.patterns}).then(sendResponse)
            chrome.storage.local.get(['synurl']).then(response => {
              if (response.synurl) {
                sync_write();
              }
            })

            break;
        case 'saveSynInfo':
            chrome.storage.local.set({ 
              synurl: request.synurl,
              synusername: request.synusername,
              synpassword: request.synpassword,
              syntime: Math.round(Date.now() / 1000) 
            }).then(() => {
              sendResponse({success: 1})
              sync_read((_res) => {
                chrome.storage.local.set({ 
                  linkmap: _res.linkmap,
                  scriptset: _res.scriptset,
                  patterns: request.patterns
                }).then()
              })
            })
            break;
        case 'getSynInfo':
          chrome.storage.local.get(['synusername', 'synpassword', 'synurl', 'syntime']).then(response => {
            if (response.synurl) {
              let { synusername, synpassword, synurl, syntime } = response
              sendResponse({
                success: 1,
                synurl,
                synusername,
                synpassword,
                syntime
              })
            } else {
              sendResponse({success: 0 })
            }
          })
          break

    }
    return true
})

const getlinkmap = async () => {
  let { linkmap } = await chrome.storage.local.get(['linkmap'])
  if (!linkmap) {
    linkmap = {
      "gh":["https://github.com", ""],
      "gg":["https://www.google.com/", ""],
      "tt":["https://twitter.com/", ""],
      "fv":["https://h.markbuild.com/flashvim.html", ""],
      "w3v": ["https://validator.w3.org/nu/?doc={$url}", ""]
    }
    chrome.storage.local.set({
      linkmap
    }).then()
  }
  return linkmap
}
const getscriptset = async () => {
  let { scriptset } = await chrome.storage.local.get(['scriptset'])
  if (!scriptset) {
    scriptset = []
    chrome.storage.local.set({
      scriptset
    }).then()
  }
  return scriptset
}

const getpatterns = async () => {
  let { patterns } = await chrome.storage.local.get(['patterns'])
  if (!patterns) {
    patterns = { 
      "prev":"prev, <, ‹, ←, «, <<, 上一页, 前页",
      "next":"next, >, ›, →, », >>, 下一页, 后页",
      "search":"search, kw, keyword, 搜索",
      "save":"save, update, 保存"
    }
    chrome.storage.local.set({
      patterns 
    }).then()
  }
  return patterns
}

var Base64 = {
    encode : function (input) {
        return btoa(unescape(encodeURIComponent(input)))
    }
}

const sync_read = async _callback => {
  let { synusername, synpassword, synurl } = await chrome.storage.local.get(['synusername', 'synpassword', 'synurl'])
  let auth_header = 'Basic ' + Base64.encode(synusername + ':' +synpassword);
  fetch(synurl, {
    method: 'GET',
    headers: new Headers({
      "Authorization": auth_header
    }),
    credentials: "same-origin"
  }).then(response => response.json()).then(myJson => {
    _callback(myJson);
  }).catch(error => console.log(error));
}
const sync_write = async () => {
  let { linkmap, scriptset, patterns, synusername, synpassword, synurl } = await chrome.storage.local.get(['linkmap', 'scriptset', 'patterns', 'synusername', 'synpassword', 'synurl'])
  let str = JSON.stringify({linkmap: linkmap, scriptset: scriptset, patterns: patterns});
  let auth_header = 'Basic ' + Base64.encode(synusername + ':' +synpassword);
  fetch(synurl, {
    method: 'PUT',
    body: str,
    headers: new Headers({
      "Authorization": auth_header
    }),
    credentials: "same-origin"
  }).then(response => {})
}

setInterval(async () => {
  let { syntime, synurl } = await chrome.storage.local.get(['syntime', 'synurl'])
  if (synurl) {
    var time = parseInt(new Date().getTime()/1000)
    if (time - syntime > 300) { // Synchronisation interval: 5 minutes
      sync_read((_res) => {
        chrome.storage.local.set({
          linkmap: _res.linkmap,
          scriptset: _res.scriptset,
          patterns: _res.patterns,
          syntime: parseInt(new Date().getTime()/1000)
        }).then()
      })
    }
  }
}, 60000); // 1 minutes
