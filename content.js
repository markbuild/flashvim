const mlog = (_info) => {console.log('%c'+_info,"color:#fff;background-image:-webkit-gradient(linear, 0% 0%, 100% 100%, from(#3E6CD0), to(#C93856));border-radius:2px;padding:2px;font-weight:bold")}
if(navigator.userAgent.includes("Firefox")) {
    mlog('FlashVim in Firefox!');
    chrome = browser;
} else {
    mlog('FlashVim in Chrome!');
}
/***+++++++++++++++++++ Event Listener ++++++++++++++++++++++++++++***/
document.addEventListener("DOMContentLoaded", () => { webinit()});
document.addEventListener('keydown', (event) => {keydownHandler(event)}, false );
document.addEventListener('keyup', (event) => {keyupHandler(event)}, false );
/***+++++++++++++++++++ Event Processor ++++++++++++++++++++++++++++***/
const webinit = () => {
    if(location.hostname == "www.bing.com" && location.pathname == "/") {
        document.body.innerHTML = document.body.innerHTML;
    }
    const bottomPanel= document.createElement("div");
    bottomPanel.id='bottompanel';
    bottomPanel.innerHTML='<div id="bp_info"></div>';
    if(document.body == null) return false;
    var first=document.body.firstChild;
    document.body.insertBefore(bottomPanel,first);
};
var cmd=''; // Command will display on Control Panel
var insert_mode = false;
var CapsLock = false;
var Shift = false;
var labelactive = false;
var labelshow = true;
var labelindex = 0;
var tid=0; // Timeout_ID
const keyupHandler = (event) => {
    if(event.keyCode == 16) {
        Shift = false;
    }
    if(event.keyCode == 27){ // ESC
        cmd='';
        updateInfoPanel('');
        insert_mode = false;
        event.target.blur();
        document.body.blur();
    }
}
const keydownHandler = (event) => {
    clearTimeout(tid);
    if(insert_mode) {
        updateInfoPanel('<span style="color:#FFEB3B">-- INSERT --</span>');
        return; 
    }
    var target_node = event.target.nodeName;
    if(target_node=='INPUT'||target_node=='TEXTAREA') {
        updateInfoPanel('<span style="color:#FFEB3B">-- INSERT --</span>');
        return;
    }
    // Prev Page | Next Page
    if(event.keyCode==37) { // Arrow Left
        var taga = document.getElementsByTagName('a');
        var alen=taga.length;
        for(var key=0;key<alen;key++){
            if(taga[key].text&&(taga[key].text.includes("上一页")||taga[key].text.includes("前页")||taga[key].text.toLowerCase().includes("prev")||taga[key].text.includes("«"))&&taga[key].href){location.replace(taga[key].href);updateInfoPanel('Prev Page');}
        }
        return;
    }
    if(event.keyCode==39) {// Arrow right 
        var taga=document.getElementsByTagName('a');
        var alen=taga.length;
        for(var key=0;key<alen;key++){
            if(taga[key].text&&(taga[key].text.includes("下一页")||taga[key].text.includes("后页")||taga[key].text.toLowerCase().includes("next")||taga[key].text.includes("»"))&&taga[key].href){location.replace(taga[key].href);updateInfoPanel('Next Page');}
        }
        return;
    }
    switch(event.keyCode){
        case 16:cmd+='';Shift = true;return;// Shift
        case 20:CapsLock = !CapsLock;return;// Caps Lock
        case 96:cmd+='0';break;//numpad 0
        case 97:cmd+='1';break;
        case 98:cmd+='2';break;
        case 99:cmd+='3';break;
        case 100:cmd+='4';break;
        case 101:cmd+='5';break;
        case 102:cmd+='6';break;
        case 103:cmd+='7';break;
        case 104:cmd+='8';break;
        case 105:cmd+='9';break;
        case 106:cmd+='*';break;
        case 107:cmd+='+';break;
        case 109:cmd+='-';break;
        case 110:cmd+='.';break;
        case 111:cmd+='/';break;//numpad /
        // Delete last char
        case 8://Backspace  Delete in MacBook
        case 46:if(cmd.length>0) {event.preventDefault();cmd=cmd.substring(0,cmd.length-1)} break;//Delete
        case 13:cmd='';break;//Enter
        case 48:Shift?cmd+=')':cmd+='0';break;
        case 49:Shift?cmd+='!':cmd+='1';break;
        case 50:Shift?cmd+='@':cmd+='2';break;
        case 51:Shift?cmd+='#':cmd+='3';break;
        case 52:Shift?cmd+='$':cmd+='4';break;
        case 53:Shift?cmd+='%':cmd+='5';break;
        case 54:Shift?cmd+='^':cmd+='6';break;
        case 55:Shift?cmd+='&':cmd+='7';break;
        case 56:Shift?cmd+='*':cmd+='8';break;
        case 57:Shift?cmd+='(':cmd+='9';break;
        case 59: // Firefox
        case 186:Shift?cmd+=':':cmd+=';';break; // Chrome
        case 61: // Firefox 
        case 187:Shift?cmd+='+':cmd+='=';break; // Chrome
        case 188:Shift?cmd+='<':cmd+=',';break;
        case 173: // Firefox 
        case 189:Shift?cmd+='_':cmd+='-';break; // Chrome
        case 190:Shift?cmd+='>':cmd+='.';break;
        case 191:Shift?cmd+='?':cmd+='/';break;
        //case 192:Shift?cmd+='~':cmd+='`';break;
        case 219:Shift?cmd+='{':cmd+='[';break;
        case 220:Shift?cmd+='|':cmd+='\\';break;
        case 221:Shift?cmd+='}':cmd+=']';break;
        case 222:Shift?cmd+='"':cmd+='\'';break;
        default:{
            if(event.keyCode >=65 && event.keyCode <=90) { // A ~ Z
                (CapsLock!=Shift)?cmd+=String.fromCharCode(event.keyCode):cmd+=String.fromCharCode(event.keyCode).toLowerCase(); 
            } else {
                return;
            }
        }
    }
    if($id('bp_info')) updateInfoPanel(cmd);
    // Process instruction 
    switch(cmd){
        case '/'://Search
            if(location.host.match(/google\.com/)){
                $id('lst-ib').focus();$id('lst-ib').style.color=randomcolor();$id('lst-ib').style.background="#000";$id('lst-ib').style.borderRadius="4px";$id('lst-ib').style.padding="0 3px";
            } else if(location.host.match(/baidu\.com/)){
                $id('kw').focus();$id('kw').style.color=randomcolor();$id('kw').style.background="#000";$id('kw').style.borderRadius="2px";$id('kw').style.padding="0 3px";
            } else if(location.href.match(/doku\./)){
                $id('qsearch__in').focus();$id('qsearch__in').style.color=randomcolor();$id('qsearch__in').style.background="#000";
            } else if(location.host.match(/bing\.com/)){
                $id('sb_form_q').focus();$id('sb_form_q').style.color=randomcolor();$id('sb_form_q').style.background="#000";$id('sb_form_q').style.borderRadius="4px";$id('sb_form_q').style.padding="0 3px";
            } else {
                cmd='';break;
            }
            event.preventDefault(); 
            cmd='';break;
        case ':date':
            cmd='';updateInfoPanel(new Date()).toString().slice(0,24);break;
        case ':tc'://Google Translate:to Chinese
            if(location.host.startsWith('translate.google.com')) {
               location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=zh-CN&text='+$id('source').value;
            } else if(location.href.startsWith('http')) {
                open('https://translate.google.com/translate?sl=auto&tl=zh-CN&u='+location.href);
            }
            cmd='';break;
        case ':td'://Google Translate:to German 
            if(location.host.startsWith('translate.google.com')) {
               location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=de&text='+$id('source').value;
            } else if(location.href.startsWith('http')) {
                open('https://translate.google.com/translate?sl=auto&tl=de&u='+location.href);
            }
            cmd='';break;
        case ':te'://Google Translate:to English
            if(location.host.startsWith('translate.google.com')) {
               location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='+$id('source').value;
            } else if(location.href.startsWith('http')) {
                open('https://translate.google.com/translate?sl=auto&tl=en&u='+location.href);
            }
            cmd='';break;
        case ':tf'://Google Translate:to French 
            if(location.host.startsWith('translate.google.com')) {
               location.href='https://translate.google.com/#view=home&op=translate&sl=auto&tl=fr&text='+$id('source').value;
            } else if(location.href.startsWith('http')) {
                open('https://translate.google.com/translate?sl=auto&tl=fr&u='+location.href);
            }
            cmd='';break;
        case ':e': // Reload the page
        case ';e': // Fault tolerance 
            location.reload();break;
        case ':q': // Quit this tab,close tab
        case ';q': // Fault tolerance 
            chrome.runtime.sendMessage({type:'removecurrenttab'});break;
        case ":sav": 
               if(location.pathname.match(/doku\.php/)){ // work for dokuwiki
                   $id("edbtn__save").click();
               }
               break;
        case ';tabnew':
        case ':tabnew': window.open(''); break;
        case ':imglist'://Display all the big original images on the bottom
               getImgList(); cmd='';break;
        case ':imghide'://Hide all the images
               hideallimage();cmd='';break;
        case ':insertjquery':
               var script = document.createElement('script');
               script.setAttribute('src', "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.9.1.js");
               mlog('insertjquery');
               $tag('head')[0].appendChild(script);cmd='';break;
        case 'dd':
               try{document.getSelection().anchorNode.parentNode.innerHTML='';} catch(err){} cmd='';break;
        case 'gg'://Scroll to Top
               window.scrollTo(0,0);cmd='';break;
        case 'gt': // Go to next tab
               chrome.runtime.sendMessage({type:'changetab',direction:1});cmd='';break;
        case 'gT': // Go to previous tab
               chrome.runtime.sendMessage({type:'changetab',direction:-1});cmd='';break;
        case 'G': // Scroll to Bottom
               window.scrollTo(0,document.body.scrollHeight);cmd='';break;
        case 'l':// Hide or Show labels
               cmd='';
               if(!labelactive){
                   insertlabels($tag('input'),0);
                   insertlabels($tag('textarea'),0);
                   insertlabels($tag('select'),0);
                   insertlabels($tag('button'),0);
                   insertlabels($tag('a'),1);
                   labelactive = true;
               } else{
                   var spans = $tag('span');
                   for(var key in spans){
                       if(spans[key].className=="mk_vim_label"){
                           if(labelshow){
                               spans[key].style.opacity=0;
                           }else{
                               spans[key].style.opacity=1;
                           }
                       }
                   }
                   labelshow = labelshow?false:true;
               }
               break;
        case "i": 
               if(location.pathname.match(/doku\.php/)){ // work for wiki
                   $id('dokuwiki__pagetools').getElementsByTagName("a")[0].click()
               }
               cmd='';break;
        case 'j': // Scroll Down
               window.scrollTo(0,document.documentElement.scrollTop+window.screen.height/2);cmd='';break;
        case 'k': // Scroll Up
               window.scrollTo(0,document.documentElement.scrollTop-window.screen.height/2);cmd='';break;
        case 'x':
               try{document.getSelection().anchorNode.parentNode.innerHTML=document.getSelection().anchorNode.textContent.replace(document.getSelection().toString(),"");} catch(err){} cmd=''; break;
    }
    if(cmd.match(/^\.\w+\.$/)) { //If match /string..
        chrome.runtime.sendMessage({type:'getlink',cmd:cmd.slice(1,-1)},function (response) {
            console.log('content get response:',response);
            response != null ? open(response) : 0;
            cmd ='';
        });
    } else if(cmd.match(/^\d+gt$/)){//Go to tab in position \d
        chrome.runtime.sendMessage({type:'changetab',num:cmd.slice(0,-2)});
        cmd='';
    } else if(cmd.match(/^\d+r$/)){// [r]edirect to the link by label id 
        window.location.href=$id('mk_label'+cmd.slice(0,-1)).parentElement.href;
        cmd='';
    } else if(cmd.match(/^\d+n$/)){// [o]pen a link in a new tab by label id
        open($id('mk_label'+cmd.slice(0,-1)).parentElement.href);
        $id('mk_label'+cmd.slice(0,-1)).style.opacity=0;//Hide aim label
        cmd='';
    } else if(cmd.match(/^\d+c$/)){// [c]lick the link by label id
        $id('mk_label'+cmd.slice(0,-1)).nextElementSibling.click();
        cmd='';
    } else if(cmd.match(/^\d+f$/)){// [f]ocus aim element by label id
        $id('mk_label'+cmd.slice(0,-1)).nextElementSibling.focus();
        $id('mk_label'+cmd.slice(0,-1)).style.opacity=0;//Hide aim label
        cmd='';
    } else if(cmd.match(/^\+[a-z0-9-\.]+\.(com|io|us|cn|jp|de|fr|ru|local)$/)){
        open('http://'+cmd.slice(1));
        cmd='';
    } else if(cmd.match(/^=[a-z0-9-\.]+\.(com|io|us|cn|jp|de|fr|ru|local)$/)){
        window.location.href='http://'+cmd.slice(1);
        cmd='';
    }
    timeout(4).then(()=>{ cmd='';updateInfoPanel('')});
}

/*++++++++++++++++++++ Helper Function +++++++++++++++++++++++*/
const $id = (elem) => document.getElementById(elem);
const $tag = (elem) => document.getElementsByTagName(elem);
const randomcolor = () => ['#f44336','#db43f5','#8549ef','#2196f3','#00bcd4','#21ccbc','#8bc34a','#ffeb3b','#ff9800','#ccc'][Math.ceil(Math.random()*11)-1];
const updateInfoPanel = (data) => {if(!$id('bottompanel')) return;$id('bottompanel').style.display=data?'block':'none'; $id('bp_info').innerHTML=data }

/* Get all the big images */
const getImgList = () => {
    var imgs = $tag('img');
    var i=0,l=imgs.length;
    var html ='<h1 class="notice">Image List</h1>';
    for(i;i<l;i++){
        imgPath = imgs[i].getAttribute('src');
        if(imgs[i].width<200||imgs[i].height<200) continue;
        if(html.includes(imgPath)) continue;
        html +='<img src="'+imgPath+'"/>'+imgs[i].width+'px width * '+imgs[i].height+'px height';
    }

    var srcs= $tag('a');
    i=0,l=srcs.length;
    for(i;i<l;i++){
        srcPath = srcs[i].getAttribute('href');
        if(!srcPath) continue;
        var reg = /.+\.(jpg|jpeg|png|gif)$/i;
        if (srcPath.match(reg)) {
            if(html.includes(srcPath)) continue;
            html+='<img src="'+srcPath+'"/>';
        }
    }

    if(!$id('mk_images_box')){
        var new_elem = document.createElement("div");
        new_elem.id="mk_images_box";
        document.body.appendChild(new_elem);
    }
    $id('mk_images_box').innerHTML = html;
}

const insertlabels = (elems,type) => {
    for(var key in elems) {
        if(!key.match(/^\d+$/)) continue;
        if(type==1&&!elems[key].innerHTML) continue;
        if(type==0&&elems[key].type=="hidden") continue;
        var new_elem = document.createElement("span");
        new_elem.id="mk_label"+(++labelindex);
        new_elem.className='mk_vim_label';
        new_elem.innerHTML=labelindex;
        if(type==1){
            elems[key].insertBefore(new_elem,elems[key].childNodes[0]);
        } else {
            elems[key].parentElement.insertBefore(new_elem,elems[key]);
        }
    }
}
const hideallimage = () => { var imgs = $tag('img'); var i=0,l=imgs.length; for(i;i<l;i++) { imgs[i].style.opacity = 0 } }
const timeout = (s) => new Promise((resolve, reject) => { tid = setTimeout(resolve, 1000*s, 'done');});
