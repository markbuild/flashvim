# flashvim
![](source/128.png?raw=true)

Vim for Chrome and Firefox.

https://addons.mozilla.org/en-US/firefox/addon/flashvim/

### Operational Demo

[Youtube](https://youtu.be/LQHhpkIytZo)

[![IMAGE ALT TEXT HERE](https://i.ytimg.com/vi/LQHhpkIytZo/hqdefault.jpg)](https://youtu.be/LQHhpkIytZo)

[操作演示![IMAGE ALT TEXT HERE](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/TencentVideo.svg/250px-TencentVideo.svg.png)](https://v.qq.com/txp/iframe/player.html?vid=o0839dm2abb)

### Command
```
Navigating the current page:

:help              Help
h                  Follow the link labeled 'previous' or '<'. Helpful for browsing paginated sites.
j                  Scroll down
k                  Scroll up
l                  Follow the link labeled 'next' or '>'. Helpful for browsing paginated sites.
gg                 Scroll to top of the page
G                  Scroll to bottom of the page
:e<Enter>          Reload current page

Manipulating tabs:

gT                 Go to next tab
gt                 Go to previous tab
1gt                Go to the first tab
{i}gt              Go to tab in position {i}
:tabnew<Enter>     Open a new tab
:q<Enter>          Close current tab
:qa<Enter>         Close all tabs
:tabm {i}<Enter>   Move the current tab page to after tab page {i}. 

Navigating to new pages:

b                  Show/Hide label IDs
{i}n               Open the link which label ID is {i} in a new tab
{i}r               Redirect to the link which label ID is {i}
{i}c               Click the element which label ID is {i}
{i}f               Focus on the element which label ID is {i} 
.<key>.            Open the link which you stored in the linkmap by key

Additional advanced browsing commands:

/                  Focus on the search input box
:imglist<Enter>    Display all the big original images on the bottom
:hideimg<Enter>    Hide all the images
:date<Enter>       Display the Date and Time
:tc<Enter>         Translate to Chinese
:te<Enter>         Translate to English
:tf<Enter>         Translate to French

ESC will clear any commands and will also exit insert modes.

F4 disable/enable Flashvim on the domain of current page 

```


### Screenshot

![](screenshot/1.png?raw=true)

![](screenshot/2.png?raw=true)

