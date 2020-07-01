console.log('%cMore about FlashVim >> https://h.markbuild.com/flashvim.html', "color:#fff;background-image:linear-gradient(90deg, #3E6CD0,#C93856 130px, #444 130px);padding:2px;")
if (navigator.userAgent.includes("Firefox")) { // 兼容Firefox
    chrome = browser
}

/***+++++++++++++++++++ Data init  ++++++++++++++++++++++++++++***/
const $id = _id => document.getElementById(_id)
const qSA = _s => document.querySelectorAll(_s)
const currentPage = location.origin + location.pathname
const flashvim = {
    disable: self == top && localStorage.getItem('DisableFlashVimPages') ? JSON.parse(localStorage.getItem('DisableFlashVimPages')).indexOf(currentPage) != -1 : false,
    // Failed to read the 'localStorage' property from 'Window': The document is sandboxed and lacks the 'allow-same-origin' flag.
    insertMode: false, // 插入模式
    isCreateLabels: false, // 是否创建了链接/表单Label
    showLabels: true, // 是否显示链接/表单Label
    capsLock: false, // 大小写锁
    prevPatterns: '',
    nextPatterns: '',
    searchPatterns: '',
    savePatterns: '',
    tid: 0, // timeout ID
    timeout: s => new Promise((resolve, reject) => { this.tid = setTimeout(resolve, 1000 * s, 'done') }),
    clearTimeout: _ => { clearTimeout(this.tid) }
}

chrome.runtime.sendMessage({type:'getpatterns'}, response => { // 初始化上/下一页 搜索匹配
    flashvim.prevPatterns = response.prev
    flashvim.nextPatterns = response.next
    flashvim.searchPatterns = response.search
    flashvim.savePatterns = response.save
})

/***+++++++++++++++++++ Methods ++++++++++++++++++++++++++++***/
flashvim.createLabels = function() { // 创建链接/表单Label
    this.isCreateLabels = true
    qSA('a, input, textarea, select, button').forEach((elem, index) => {
        if (elem.type == 'hidden') return true
        if (elem.tagName === 'A' && !elem.innerHTML) return true
        let newElem = document.createElement('span')
        newElem.id = 'flashvim_label' + index
        newElem.className = 'flashvim_label'
        newElem.innerHTML = index
        if (elem.tagName === 'A') {
            elem.insertBefore(newElem, elem.childNodes[0])
        } else {
            elem.parentElement.insertBefore(newElem, elem)
        }
    })
}
flashvim.hideLabels = function() {
    this.showLabels = !this.showLabels
    var opacity = this.showLabels ? 1 : 0
    qSA('.flashvim_label').forEach(elem => {
        elem.style.opacity = opacity
    })
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

flashvim.commandHandler = function(_type) {
    if (!this.cmd) {
        this.hideInfoPanel()
        return
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
                chrome.runtime.sendMessage({type:'closeCurrentTab'});break;
            case ':xa': // Close all tabs
            case ';xa': // Fault tolerance 
            case ':qa': // Close all tabs
            case ';qa': // Fault tolerance 
                chrome.runtime.sendMessage({type:'closeAllTab'});break;
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
                if(location.host.startsWith('translate.google.com')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=zh-CN&text='+$id('source').value
                } else if(location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=zh-CN&u='+location.href)
                }
                break
            case ':te':// Google Translate:to English
                if(location.host.startsWith('translate.google.com')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='+$id('source').value
                } else if(location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=en&u='+location.href)
                }
                break
            case ':tf':// Google Translate:to French 
                if(location.host.startsWith('translate.google.com')) {
                    location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=fr&text='+$id('source').value
                } else if(location.href.startsWith('http')) {
                    open('https://translate.google.com/translate?sl=auto&tl=fr&u='+location.href)
                }
                break
            case ':fetchimg': // Display all the big original images on the bottom
                this.fetchImgList() 
                break
            case ':se img!': // Hide all the images
            case ':set img!':
                this.hideAllImage()
                break
            case ':se img':
            case ':set img':
                this.cancelHideAllImage()
                break
            case ':!date':
                let that = this
                setTimeout(function() {
                    that.updateInfoPanel(new Date().toString().slice(0,24), 'success')
                }, 100)
                break
            case ':help':
                open('https://h.markbuild.com/flashvim.html#help')
                break
            case ':seo':
                this.showSeoInfo()
                break
            default:
                if (this.cmd.match(/^:tabm\s[0-9]+$/)) {
                    chrome.runtime.sendMessage({type:'tabm', tabIndex:cmd.slice(5)})
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
            case 'dd':
                try{
                    document.getSelection().anchorNode.parentNode.innerHTML=''
                } catch (e) {}
                this.cmd = ''
                return
            case 'gg': // Scroll to Top of the Page
                window.scrollTo(0,0)
                this.cmd = ''
                return
            case 'gt': // Go to next tab
                try {
                    chrome.runtime.sendMessage({ type:'changetab', direction: 1 })
                } catch(e) {}
                this.cmd = ''
                return
            case 'gT': // Go to previous tab
                try {
                    chrome.runtime.sendMessage({ type:'changetab', direction: -1 })
                } catch(e) {}
                this.cmd = ''
                return
            case 'G': // Scroll to Bottom of the Page
                window.scrollTo(0, document.body.scrollHeight)
                this.cmd = ''
                return
            case 'b': // Hide or Show labels
                if (!this.isCreateLabels) {
                    this.createLabels()
                } else {
                    this.hideLabels()
                }
                this.cmd = ''
                return
            case 'h': // Scroll Left
                window.scrollTo(document.documentElement.scrollLeft - window.screen.width/2, document.documentElement.scrollTop)
                this.cmd = ''
                return
            case 'j': // Scroll Down
                window.scrollTo(document.documentElement.scrollLeft, document.documentElement.scrollTop + window.screen.height/2)
                this.cmd = ''
                return
            case 'k': // Scroll Up
                window.scrollTo(document.documentElement.scrollLeft, document.documentElement.scrollTop - window.screen.height/2)
                this.cmd = ''
                return
            case 'l': // Scroll Right
                window.scrollTo(document.documentElement.scrollLeft + window.screen.width/2, document.documentElement.scrollTop)
                this.cmd = ''
                return
            case 'x':
                try {
                    let n = document.getSelection().anchorNode.data
                    let s = document.getSelection()
                    let start = Math.min(s.anchorOffset, s.focusOffset)
                    let len = s.toString().length
                    document.getSelection().anchorNode.data = n.slice(0, start) + n.slice(start + len)
                } catch (e) {}
                this.cmd = ''
                return
            default:
                if (this.cmd.match(/^\.\w+\.$/)) { //If match the key of linkmap
                    chrome.runtime.sendMessage({
                        type: 'getlink',
                        cmd: this.cmd.slice(1,-1)
                    }, response => {
                        response != null ? open(response) : 0
                        this.cmd = ''
                    })
                } else if (this.cmd.match(/^\d+gt$/)) { // Go to tab in position \d
                    try {
                        chrome.runtime.sendMessage({ type:'changetab', num: this.cmd.slice(0,-2) })
                    } catch(e) {}
                    this.cmd = ''
                } else if (this.cmd.match(/^\d+r$/)) { // [r]edirect to the link which label ID  is \d
                    window.location.href = $id('flashvim_label' + this.cmd.slice(0,-1)).parentElement.href
                    this.cmd = ''
                } else if (this.cmd.match(/^\d+n$/)) { // [o]pen the link which label ID is \d in a new tab
                    open($id('flashvim_label' + this.cmd.slice(0,-1)).parentElement.href)
                    $id('flashvim_label' + this.cmd.slice(0, -1)).style.opacity = 0 // Hide aim label
                    this.cmd=''
                } else if (this.cmd.match(/^\d+c$/)) { // [c]lick the link  which label ID is \d
                    $id('flashvim_label' + this.cmd.slice(0,-1)).nextElementSibling.click()
                    this.cmd=''
                } else if(this.cmd.match(/^\d+f$/)){// [f]ocus on the element which label ID is \d
                    let target = $id('flashvim_label' + this.cmd.slice(0,-1)).nextElementSibling
                    setTimeout(function() {
                        target.focus()
                    }, 100)
                    $id('flashvim_label' + this.cmd.slice(0,-1)).style.opacity = 0 // Hide aim label
                    this.cmd=''
                } else if(this.cmd.match(/^\+[a-z0-9-\.]+\.(com|io|us|cn|jp|de|fr|ru|local)$/)){
                    open('http://'+cmd.slice(1))
                    this.cmd=''
                } else if(this.cmd.match(/^=[a-z0-9-\.]+\.(com|io|us|cn|jp|de|fr|ru|local)$/)){
                    window.location.href='http://'+cmd.slice(1)
                    this.cmd=''
                }
                this.updateInfoPanel(this.cmd)
        }
    }
}
/* Get SEO info */
flashvim.showSeoInfo = function() {
    if (!$id('flashvim_seo_box')) {
        let newElem = document.createElement('div')
        newElem.id = 'flashvim_seo_box'
        document.body.appendChild(newElem)

    } else {
        return
    }
    var html ='<h1>SEO Information</h1>' +
              '<h3>Title & URL & meta description(25 ~ 165 characters)</h3><div class="serp-preview">' + 
              '<div class="serp-title">' + document.title.replace(/(^.+\s-\s)/,'') + '</div>' +
              '<div class="serp-url">' + location.origin + location.pathname + '<span class="serp-arrow"></span></div>' +
              '<div class="serp-description">' + (document.head.querySelector("meta[name='description']") ? document.head.querySelector("meta[name='description']").content : '') + '</div></div>' +
              '<h3>Keywords</h3>' + (document.head.querySelector("meta[name='keywords']") ? document.head.querySelector("meta[name='keywords']").content : '') + '</p>';
    html += '<h3>h1</h3>';
    qSA('h1').forEach(function(_elem){ html += '<p>'+_elem.innerText + '</p>'} );
    html += '<h3>h2</h3>';
    qSA('h2').forEach(function(_elem){ html += '<p>'+_elem.innerText + '</p>'} );
    html += '<h3>img alt</h3><table>';
    qSA('img').forEach(function(_elem){ html += '<tr><td>'+_elem.alt + '</td><td><img style="max-width:100px" src="' + _elem.src + '"></td><td>'+_elem.src+'</td></tr>'} );
    html += '</table><h3>Anchor Text</h3><table>';
    qSA('a').forEach(function(_elem){ if(_elem.href.startsWith('http')) { html += '<tr><td>' + _elem.href + '</td><td>' + _elem.title + '</td><td>' + _elem.innerText + '</td><td>' + _elem.parentElement.innerText + '</td></tr>'}} );
    html += '</table>';
    $id('flashvim_seo_box').innerHTML = html;
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
    if(!$id('flashvim_img_box')){
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
    if (event.keyCode == 27){ // ESC
        this.hideInfoPanel()
        event.target.blur()
        document.body.blur()
    }
}
flashvim.keydownHandler = function(event) {
    if (this.disable) return
    this.clearTimeout()
    var targetNode = event.target.nodeName
    if (targetNode === 'INPUT' || targetNode === 'TEXTAREA') {
        this.updateInfoPanel('-- INSERT --', 'warn').timeout(2).then(_=> { this.hideInfoPanel() })
        return
    }
    // Prev Page
    if (event.keyCode === 37) { // Arrow Left
        var p = this.prevPatterns.split(',')
        qSA('a').forEach(elem => {
            if(elem.text && elem.href) {
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
    // Next Page
    if (event.keyCode === 39) { // Arrow right 
        var p = this.nextPatterns.split(',')
        qSA('a').forEach(elem => {
            if(elem.text && elem.href) {
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
    var Shift = event.shiftKey
    switch (event.keyCode) {
        case 16: return // Shift
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
        case 186:Shift? this.cmd+=':':this.cmd+=';';break // Chrome
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
        default:{
            if (event.keyCode >=65 && event.keyCode <=90) { // A ~ Z
                (this.capsLock != Shift) ? this.cmd += String.fromCharCode(event.keyCode) : this.cmd += String.fromCharCode(event.keyCode).toLowerCase() 
            } 
        }
    }
}
flashvim.mouseOverHandler = function(event) {
    if (0) {
        console.log(event.pageX, event.pageY)
    }
}

/*++++++++++++++++++++ Watcher +++++++++++++++++++++++*/
Object.defineProperties(flashvim, {
    cmd: {
        configurable: true,
        get: function() {
            return cmd
        },
        set: function(newValue) {
            cmd = newValue
            this.commandHandler()
        }
    }
})
flashvim.cmd = ''

/***+++++++++++++++++++ Event Listener ++++++++++++++++++++++++++++***/
// https://stackoverflow.com/questions/12045440/difference-between-document-addeventlistener-and-window-addeventlistener
document.addEventListener("DOMContentLoaded", _ => { flashvim.createInfoPanel() })
document.addEventListener('keydown', event => { flashvim.keydownHandler(event) }, false)
document.addEventListener('keyup', event => { flashvim.keyupHandler(event) }, false)
