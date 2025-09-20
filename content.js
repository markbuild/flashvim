/***+++++++++++++++++++ Data init  ++++++++++++++++++++++++++++***/
const $id = _id => document.getElementById(_id)
const qSA = _s => document.querySelectorAll(_s)
const currentPage = location.origin + location.pathname
const currentDomain = location.hostname
const currentRootDomain = currentDomain.replace(currentDomain.replace(/[^\.]+\.[^\.]+$/, ''), '')
var lastkeycode = 0
var maxScrollElement
const flashvim = {
    disable: self == top && localStorage.getItem('DisableFlashVimPages') ? JSON.parse(localStorage.getItem('DisableFlashVimPages')).indexOf(currentPage) != -1 : false,
    // Failed to read the 'localStorage' property from 'Window': The document is sandboxed and lacks the 'allow-same-origin' flag.
    isCreateLabels: false, // 是否创建了链接/表单Label
    capsLock: false, // 大小写锁
    prevPatterns: '',
    nextPatterns: '',
    searchPatterns: '',
    savePatterns: '',
    tid: 0, // timeout ID
    timeout: s => new Promise((resolve, reject) => { this.tid = setTimeout(resolve, 1000 * s, 'done') }),
    clearTimeout: _ => { clearTimeout(this.tid) },
}

chrome.runtime.sendMessage({ type:'getpatterns' }).then(response => { // 初始化上/下一页 搜索匹配
    flashvim.prevPatterns = response.prev
    flashvim.nextPatterns = response.next
    flashvim.searchPatterns = response.search
    flashvim.savePatterns = response.save
})

/***+++++++++++++++++++ Methods ++++++++++++++++++++++++++++***/
function convert26(num){
   var str=""
   while (num > 0){
     var m = num % 26;
     if (m == 0){
       m = 26
     }
     str = String.fromCharCode(m + 96) + str
     num = (num - m) / 26
   }
   return str
}
flashvim.createLabels = function() { // 创建链接/表单Label
    this.isCreateLabels = true
    qSA('a, input, textarea, select, button').forEach((elem, index) => {
        if (elem.type == 'hidden') return true
        let newElem = document.createElement('span')
        index = convert26(index + 1)
        newElem.id = 'flashvim_label' + index
        newElem.className = 'flashvim_label'
        newElem.innerHTML = index
        if (['TEXTAREA', 'INPUT', 'SELECT'].includes(elem.tagName)) {
            elem.parentElement.insertBefore(newElem, elem)
        } else if (elem.childNodes) {
            elem.insertBefore(newElem, elem.childNodes[0])
        }
    })
}
flashvim.removeLabels = function() {
    qSA('.flashvim_label').forEach(elem => {
      elem.remove()
    })
    this.isCreateLabels = false
}
/* Create Information Panel */
flashvim.createInfoPanel = function() {
    if (document.body == null) return false
    const infoPanel = document.createElement('div')
    infoPanel.id = 'flashvim_info_panel'
    infoPanel.innerHTML = '<div id="flashvim_info" onmouseover="this.parentElement.style.display=\'none\'"></div>'
    var first=document.body.firstChild
    document.body.insertBefore(infoPanel, first)
}
/* Hide Information Panel */
flashvim.hideInfoPanel = function() {
    try {
        $id('flashvim_info_panel').style.display = 'none'
    } catch (e) {}
}
/* Update Information Panel */
flashvim.updateInfoPanel = function(info ,type) {
    try {
        switch(type) {
            case 'success':
                $id('flashvim_info_panel').style.display = 'block'
                $id('flashvim_info').innerHTML = '<span class="success">' + info + '</span>'
                break
            case 'warn':
                $id('flashvim_info_panel').style.display = 'block'
                $id('flashvim_info').innerHTML = '<span class="warn">' + info + '</span>'
                break
            default:
                if (!info) {
                    $id('flashvim_info_panel').style.display = 'none'
                } else {
                    $id('flashvim_info_panel').style.display = 'block'
                    $id('flashvim_info').innerHTML = info.replace(' ', '&nbsp;')
                }
        }
    } catch (e) {}
    return this
}
/* findMaxScrollElement */
flashvim.getMaxScrollElement = function() {
  let maxHeight = -1
  function findMaxScrollElement(element) {
    if (element.scrollHeight > maxHeight + 100) {
      maxHeight = element.scrollHeight;
      var doctype = document.doctype
      if (doctype && document.doctype.publicId.includes('HTML 4') && element.nodeName === 'HTML') {
        maxScrollElement = document.querySelector('body')
      } else {
        maxScrollElement = element
      }
    }

    for (let i = 0; i < element.children.length; i++) {
      findMaxScrollElement(element.children[i]);
    }
  }

  findMaxScrollElement(document.documentElement);
}

flashvim.commandHandler = function(_type) {
    let that = this
    if (!this.cmd) {
        this.hideInfoPanel()
        return
    }
    if (!maxScrollElement) {
      this.getMaxScrollElement()
    }
    if (_type === 'enter') {
        switch (this.cmd) {
            case ':e': // Reload the page
            case ';e': // Fault tolerance 
                location.reload();break
            case ':x': // Quit this tab, close tab
            case ';x': // Fault tolerance 
            case ':q': // Quit this tab, close tab
            case ';q': // Fault tolerance 
                try {
                    chrome.runtime.sendMessage({type:'closeCurrentTab'});break;
                } catch(e) {}
            case ':xa': // Close all tabs
            case ';xa': // Fault tolerance 
            case ':qa': // Close all tabs
            case ';qa': // Fault tolerance 
                try {
                    chrome.runtime.sendMessage({type:'closeAllTab'});break;
                } catch(e) {}
            case ":w": 
                let saveBtns = qSA('input[type=submit], input[type=button],button')
                let patterns = this.savePatterns.split(',')
                for (let key = 0; key < saveBtns.length; key++) {
                    for (let i in patterns) {
                        if (saveBtns[key].outerHTML.replace(/\s*/g, '').includes(patterns[i].trim())) {
                            setTimeout(function() {
                                saveBtns[key].click()
                            }, 100)
                            this.cmd = ''
                            return
                        }

                    }
                }
                this.cmd = ''
                return
            case ';tabnew':
            case ':tabnew': 
                window.open(''); break
            case ':tc': // Google Translate:to Chinese
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=zh-CN&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=zh-CN&u='+location.href)
                }
                break
            case ':te':// Google Translate:to English
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=en&u='+location.href)
                }
                break
            case ':tf':// Google Translate:to French 
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=fr&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=fr&u='+location.href)
                }
                break
            case ':tj':// Google Translate:to 日本語
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=ja&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=ja&u='+location.href)
                }
                break
            case ':tk':// Google Translate:to 한국어
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=ko&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=ko&u='+location.href)
                }
                break
            case ':tp':// google Translate:to Português
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=pt&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=pt&u='+location.href)
                }
                break
            case ':tr':// google translate:to Русский
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=ru&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=ru&u='+location.href)
                }
                break
            case ':ts':// Google Translate:to español
                if (location.host.startsWith('translate.google')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=es&text='+document.querySelectorAll('textarea')[0].value
                } else if (location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=es&u='+location.href)
                }
                break
            case ':fetchimg': // Display all the big original images on the bottom
                this.fetchImgList()
                break
            case ':rmifr': // 清楚广告中的iframe等遮挡物
                document.querySelectorAll('iframe').forEach(item => item.remove())
                break
            case ':se img!': // Hide all the images
            case ':set img!':
                this.hideAllImage()
                break
            case ':se img':
            case ':set img':
                this.cancelHideAllImage()
                break
            case ':se fs': // 是否显示全屏
            case ':set fs':
              if (document.documentElement.mozRequestFullscreen) {
                document.documentElement.mozRequestFullscreen()
              } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen()
              }
              break
            case ':se fs!':
            case ':set fs!':
              if (document.documentElement.mozCancelFullscreen) {
                document.documentElement.mozCancelFullscreen()
              } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen()
              }
              break
            case ':!date':
                setTimeout(function() {
                    that.updateInfoPanel(new Date().toString().slice(0,24), 'success')
                }, 100)
                break
            case ':!locale':
                setTimeout(function() {
                    that.updateInfoPanel(navigator.languages.toString(), 'success')
                }, 100)
                break
            case ':help':
                open('https://h.markbuild.com/flashvim.html#help')
                break
            default:
                if (this.cmd.match(/^:tabm\s[0-9]+$/)) {
                    try {
                        chrome.runtime.sendMessage({type:'tabm', tabIndex:cmd.slice(5)});
                    } catch(e) {}
                } else if (this.cmd.match(/^\.(\w|\/)+$/)) { //If match the key of linkmap
                    try {
                        chrome.runtime.sendMessage({
                            type: 'getlink',
                            cmd: this.cmd.slice(1)
                        }).then(response => {
                            response != null ? open(response.replace('{$domain}', currentDomain).replace('{$rootDomain}', currentRootDomain).replace('{$url}', currentPage)) : 0
                            this.cmd = ''
                        })
                    } catch(e) {}
                } else if (this.cmd.match(/^'[A-z0-9\.\/\-]+$/)) {
                    open('http://'+cmd.slice(1))
                } else if (this.cmd.match(/^;[A-z0-9\.\/\-]+$/)) {
                    window.location.href='http://'+cmd.slice(1)
                }
        }
        this.cmd = ''
    } else {
        switch(this.cmd) {
            case '?':
            case '/': // Search
                var taginput = document.getElementsByTagName('input')
                var inputlen = taginput.length
                var patterns = this.searchPatterns.split(',')
                for (let key=0; key < inputlen; key++) {
                    if (taginput[key].type == "search") {
                        setTimeout(function() {
                            taginput[key].focus()
                        }, 100)
                        this.cmd = ''
                        return
                    }
                    if (taginput[key].type == "" || taginput[key].type === 'text') {
                        for (let i in patterns) {
                            if (taginput[key].outerHTML.replace(/\s*/g, '').includes(patterns[i].trim())) {
                                setTimeout(function() {
                                    taginput[key].focus()
                                }, 100)
                                this.cmd = ''
                                return
                            }
                        }
                    }
                }
                event.preventDefault()
                this.cmd = ''
                return
            case 'gg': // Scroll to Top of the Page
                maxScrollElement.scrollTo(0, 0)
                this.cmd = ''
                return
            case 'gt': // Go to next tab
                try {
                    chrome.runtime.sendMessage({ type:'changetab', direction: 1 });
                } catch(e) {}
                this.cmd = ''
                return
            case 'gT': // Go to previous tab
                try {
                    chrome.runtime.sendMessage({ type:'changetab', direction: -1 });
                } catch(e) {}
                this.cmd = ''
                return
            case 'G': // Scroll to Bottom of the Page
                maxScrollElement.scrollTo(0, maxScrollElement.scrollHeight)
                this.cmd = ''
                return
            case 'b': // Hide or Show labels
                if (!this.isCreateLabels) {
                    this.createLabels()
                } else {
                    this.removeLabels()
                }
                this.cmd = ''
                return
            case 'h':
                this.prevPage()
                this.cmd = ''
                return
            case 'l':
                this.nextPage()
                this.cmd = ''
                return
            case 'j': // Scroll Down
                maxScrollElement.scrollTo(0, maxScrollElement.scrollTop + window.screen.height/2)
                this.cmd = ''
                return
            case 'k': // Scroll Up
                maxScrollElement.scrollTo(0, maxScrollElement.scrollTop - window.screen.height/2)
                this.cmd = ''
                return
            case 'h':
            case 'l':  
                this.cmd = ''
                return
            case 'w':
                this.cmd = ''
                return
            case 'x':
                try {
                    let n = document.getSelection().deleteFromDocument()
                } catch (e) {}
                this.cmd = ''
                return
            default:
 
                if (this.cmd.match(/^\.[a-z]+;$/)) { // click the link or button which label ID is \d in a new tab
                    var elem = $id('flashvim_label' + this.cmd.slice(1,-1))
                    this.cmd=''
                    if (!elem) {
                      this.removeLabels()
                      return
                    }
                    if (['TEXTAREA', 'INPUT', 'SELECT'].includes(elem.nextElementSibling?.tagName)) {
                      let target = elem.nextElementSibling
                      setTimeout(() => {
                        target.focus()
                      }, 100)
                    } else if (elem.parentElement) {
                      elem.parentElement.click()
                    }
                    this.removeLabels()
                } else if (this.cmd.match(/^\d+gt$/)) { // Go to tab in position \d
                    try {
                        chrome.runtime.sendMessage({ type:'changetab', num: this.cmd.slice(0,-2) });
                    } catch(e) {}
                    this.cmd = ''
                }
                if ([':', '.', '\'', ';'].includes(this.cmd[0])) {
                  this.updateInfoPanel(this.cmd)
                }
        }
    }
    that.timeout(4).then(_ =>{ that.cmd='';that.updateInfoPanel('')});
}
/* Get all the big images */
flashvim.fetchImgList = function() {
    var html ='<h1 class="notice">Image List</h1>';
    qSA('img').forEach(elem => {
        let imgPath = elem.getAttribute('src')
        if (elem.width<200 || elem.height<200) return true
        if (html.includes(imgPath)) return false
        html += '<img src="'+imgPath+'"/>' + elem.width + 'px width * ' + elem.height + 'px height'
    })
    qSA('a').forEach(elem => {
        let srcPath = elem.getAttribute('href')
        if (!srcPath) return true
        let reg = /.+\.(jpg|jpeg|png|gif)$/i
        if (srcPath.match(reg)) {
            if (html.includes(srcPath)) return false
            html += '<img src="' + srcPath + '"/>'
        }
    })
    if (!$id('flashvim_img_box')){
        var newElem = document.createElement("div")
        newElem.id="flashvim_img_box"
        document.body.appendChild(newElem)
    }
    $id('flashvim_img_box').innerHTML = html
}
flashvim.hideAllImage = function() {
    qSA('img').forEach(elem => {
        elem.style.opacity = 0
    })
}
flashvim.cancelHideAllImage = function() {
    qSA('img').forEach(elem => {
        elem.style.opacity = 1
    })
}
flashvim.keyupHandler = function(event) {
    if (event.keyCode == 115) { // F4
        var DisableFlashVimPages = localStorage.getItem('DisableFlashVimPages') ? JSON.parse(localStorage.getItem('DisableFlashVimPages')) : []
        if (this.disable) {
            DisableFlashVimPages = DisableFlashVimPages.filter(item => item !== currentPage)
            if (DisableFlashVimPages.length) {
                localStorage.setItem('DisableFlashVimPages', JSON.stringify(DisableFlashVimPages))
            } else {
                localStorage.removeItem('DisableFlashVimPages')
            }
            this.updateInfoPanel('Flashvim Enabled', 'success')
        } else {
            DisableFlashVimPages.push(currentPage)
            localStorage.setItem('DisableFlashVimPages', JSON.stringify(DisableFlashVimPages))
            this.updateInfoPanel('Flashvim Disabled', 'warn').timeout(1).then(_ => { this.hideInfoPanel() })
        }
        this.disable = !this.disable
    }
    if (this.disable) return
    if (
      (event.ctrlKey && event.keyCode == 67) ||
      (lastkeycode == 17 && event.keyCode == 67) ||
      (event.ctrlKey && event.keyCode == 219) ||
      (event.keyCode == 27)
    ) { // Ctrl-C or Ctrl-[ or ESC
        this.cmd = ''
        this.hideInfoPanel()
        this.removeLabels()
        event.target.blur()
        document.body.blur()
    }
    lastkeycode = event.keyCode
}
flashvim.keydownHandler = function(event) {
    if (this.disable) return
    this.clearTimeout()
    if (event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA' || event.target.isContentEditable) {
        this.updateInfoPanel('-- INSERT --', 'warn').timeout(2).then(_=> { this.hideInfoPanel() })
        return
    }
    // Prev Page
    if (event.keyCode === 37) { // Arrow Left
      this.prevPage()
      return
    }
    // Next Page
    if (event.keyCode === 39) { // Arrow right
      this.nextPage()
      return
    }
    var Shift = event.shiftKey
    if (!this.cmd.match(/^(\.|:|;|'|\d|d$|g$)/)) {
      this.cmd = ''
    }
    if (this.cmd.match(/^\d+$/) && event.keyCode != 71 && !(event.keyCode > 95 && event.keyCode <106) && !(event.keyCode > 47 && event.keyCode < 58 && !Shift)) {
      this.cmd = ''
    }
    if (this.cmd.match(/^\d+g$/) && event.keyCode != 84) {
      this.cmd = ''
    }
    if (this.cmd == 'd' && event.keyCode != 68) {
      this.cmd = ''
    }
    if (this.cmd == 'g' && event.keyCode != 84 && event.keyCode != 71 && event.keyCode != 16) {
      this.cmd = ''
    }
    switch (event.keyCode) {
        case 16: return // Shift
        case 17: return // Ctrl
        case 20: this.CapsLock = !this.CapsLock; return // Caps Lock
        case 32: this.cmd+=' '; if (this.cmd.length > 1) { event.preventDefault() } else { this.cmd = '' }; break // spacebar
        case 96: this.cmd+='0';break //numpad 0
        case 97:this.cmd+='1';break
        case 98:this.cmd+='2';break
        case 99:this.cmd+='3';break
        case 100:this.cmd+='4';break
        case 101:this.cmd+='5';break
        case 102:this.cmd+='6';break
        case 103:this.cmd+='7';break
        case 104:this.cmd+='8';break
        case 105:this.cmd+='9';break
        case 106:this.cmd+='*';break
        case 107:this.cmd+='+';break
        case 109:this.cmd+='-';break
        case 110:this.cmd+='.';break
        case 111:this.cmd+='/';break // numpad /
        // Delete last char
        case 8://Backspace  Delete in MacBook
        case 46:if (this.cmd.length > 0) { event.preventDefault(); this.cmd = cmd.substring(0, this.cmd.length - 1)} break // Delete
        case 13: this.commandHandler('enter'); return // Enter
        case 48: Shift? this.cmd+=')':this.cmd+='0';break
        case 49: Shift? this.cmd+='!':this.cmd+='1';break
        case 50: Shift? this.cmd+='@':this.cmd+='2';break
        case 51: Shift? this.cmd+='#':this.cmd+='3';break
        case 52: Shift? this.cmd+='$':this.cmd+='4';break
        case 53: Shift? this.cmd+='%':this.cmd+='5';break
        case 54: Shift? this.cmd+='^':this.cmd+='6';break
        case 55: Shift? this.cmd+='&':this.cmd+='7';break
        case 56: Shift? this.cmd+='*':this.cmd+='8';break
        case 57: Shift? this.cmd+='(':this.cmd+='9';break
        case 59: // Firefox
        case 186:Shift? this.cmd=':':this.cmd+=';';break // Chrome
        case 61: // Firefox 
        case 187:Shift? this.cmd+='+':this.cmd+='=';break // Chrome
        case 188:Shift? this.cmd+='<':this.cmd+=',';break
        case 173: // Firefox 
        case 189:Shift? this.cmd+='_':this.cmd+='-';break // Chrome
        case 190:Shift? this.cmd+='>':this.cmd+='.';break
        case 191:Shift? this.cmd+='?':this.cmd+='/';break
        case 192:Shift? this.cmd+='~':this.cmd+='`';break
        case 219:Shift? this.cmd+='{':this.cmd+='[';break
        case 220:Shift? this.cmd+='|':this.cmd+='\\';break
        case 221:Shift? this.cmd+='}':this.cmd+=']';break;
        case 222:Shift? this.cmd+='"':this.cmd+='\'';break;
        default: {
            if (event.ctrlKey && event.keyCode === 85) { // Ctrl-U, Clear input
                this.cmd = ''
            } else if (event.keyCode >=65 && event.keyCode <=90) { // A ~ Z
                (this.capsLock != Shift) ? this.cmd += String.fromCharCode(event.keyCode) : this.cmd += String.fromCharCode(event.keyCode).toLowerCase() 
            } 
        }
    }
    return true
}
flashvim.mouseOverHandler = function(event) {
    if (0) {
        console.log(event.pageX, event.pageY)
    }
}
flashvim.prevPage = function () {
  var p = this.prevPatterns.split(',')
  qSA('a').forEach(elem => {
    if (elem.text && elem.href) {
      for(var i in p) { 
        if (elem.text.toLocaleLowerCase().includes(p[i].trim())) {
          location.replace(elem.href)
          this.updateInfoPanel('Previous Page', 'success').timeout(2).then(_ =>{ this.hideInfoPanel() })
          return
        }
      }
    }
  })
}
flashvim.nextPage = function () {
  var p = this.nextPatterns.split(',')
  qSA('a').forEach(elem => {
    if (elem.text && elem.href) {
      for(var i in p) { 
        if (elem.text.toLocaleLowerCase().includes(p[i].trim())) {
          location.replace(elem.href)
          this.updateInfoPanel('Next Page', 'success').timeout(2).then(_ =>{ this.hideInfoPanel() })
          return
        }
      }
    }
  })
}
/* Run Custom Script */
flashvim.runCustomScript = function() {
  try {
    chrome.runtime.sendMessage({ type: 'getscriptset' }).then(response => {
      response.forEach(function(item) {
        if (new RegExp(item[0]).test(currentPage)) {
          setTimeout(item[1])
        }
      })
    })
  } catch(e) {}
}
/*++++++++++++++++++++ Watcher +++++++++++++++++++++++*/
Reflect.defineProperty(flashvim, "cmd", {
    configurable: true,
    get: function() {
        return cmd
    },
    set: function(newValue) {
        cmd = newValue
        this.commandHandler()
    }
})
flashvim.cmd = ''

/***+++++++++++++++++++ Event Listener ++++++++++++++++++++++++++++***/
// https://stackoverflow.com/questions/12045440/difference-between-document-addeventlistener-and-window-addeventlistener
document.addEventListener("DOMContentLoaded", _ => { flashvim.createInfoPanel();flashvim.runCustomScript() })
document.addEventListener('keydown', event => {
  if (flashvim.keydownHandler(event)) {
    event.stopImmediatePropagation()
  }
}, true)
document.addEventListener('keyup', event => {
  if(flashvim.keyupHandler(event)) {
    event.stopImmediatePropagation()
  }
}, false)
