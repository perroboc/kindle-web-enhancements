// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       You
// @match        https://read.amazon.com/manga/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const emojiDict = {
        lr: "➡️",
        rl: "⬅️"
      };

    const regex = /(\w+)/g;
    const amazonKindleId = document.querySelector('meta[property="og:url"]').content.match(regex)[5];
    console.log(`amazon kindle id: ${amazonKindleId}`)
    //property="og:url"

    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = function(mutationList, observer) {
        // Use traditional 'for loops' for IE 11
        for(const mutation of mutationList) {
            if (mutation.type === 'childList') {
                //console.log('A child node has been added or removed.');
                for (let node of mutation.addedNodes) {
                    //console.log('A child node has been added or removed: ' + node.nodeName);
                    if (node.id === 'readerHamburgerMenu')
                    {
                        //<div class="kw-row kw-rd-hamburger-section"><div class="kw-rd-hamburger-section-inner">THE BOOK</div></div>
                        // add to readerHamburgerMenuContent, at the end
                            // <div class="kw-row kw-rd-hamburger-section">
                            //     <div class="kw-rd-hamburger-section-inner">THE BOOK</div>
                            // </div>
                            // <ul class="kw-rd-hamburger-items-list">
                            // </ul>
                        
                        if (typeof GM_getValue(amazonKindleId+'navigationDirection') === 'undefined') {
                            GM_setValue(amazonKindleId+'navigationDirection', JSON.parse(document.getElementById('bookInfo').text).contentMetadata.navigationDirection);
                        }
                        const currentDirection = GM_getValue(amazonKindleId+'navigationDirection');
                        const reverseDirection = currentDirection.split("").reverse().join("");

                        let kindle_menuNode = document.getElementById('readerHamburgerMenuContent');
                        
                        // SECTION
                        const extended_menuSectionInnerText = document.createTextNode(`Extended Menu`);
                        const extended_menuSectionInner = document.createElement('div');
                        extended_menuSectionInner.setAttribute("class", 'kw-rd-hamburger-section-inner');
                        extended_menuSectionInner.append(extended_menuSectionInnerText);

                        const extended_menuSection = document.createElement('div');
                        extended_menuSection.setAttribute("class", 'kw-row kw-rd-hamburger-section');
                        extended_menuSection.append(extended_menuSectionInner);

                        //LIST
                        const extended_menuItemsList = document.createElement('ul');
                        extended_menuItemsList.setAttribute("class", 'kw-rd-hamburger-items-list');

                        //ITEM
                        const extended_menuItemText = document.createTextNode(`Switch reading direction to ${emojiDict[reverseDirection]}`);
                        
                        const extended_menuItemLink = document.createElement('a');
                        extended_menuItemLink.setAttribute("class", 'kw-text-normal');
                        //extended_menuItemLink.setAttribute("href", 'javascript:void(0);');
                        extended_menuItemLink.setAttribute("href", '#');
                        extended_menuItemLink.setAttribute("id", 'readerHamburgerSwitchDirection');
                        extended_menuItemLink.appendChild(extended_menuItemText);

                        extended_menuItemLink.addEventListener('click', function(event){ 
                            console.log(`Switching direction! to ${reverseDirection}`);
                            GM_setValue(amazonKindleId+'navigationDirection', reverseDirection);
                            window.location.reload(false);
                        }, false);
                        
                        const extended_menuItemInner = document.createElement('div');
                        extended_menuItemInner.setAttribute("class", 'kw-rd-hamburger-item-inner');
                        extended_menuItemInner.appendChild(extended_menuItemLink);
                        
                        const extended_menuSpan = document.createElement('span');
                        extended_menuSpan.setAttribute("class", 'kw-list-item');
                        extended_menuSpan.appendChild(extended_menuItemInner);
                        
                        const extended_menuItem = document.createElement('li');
                        extended_menuItem.setAttribute("class", 'kw-rd-hamburger-item');
                        extended_menuItem.appendChild(extended_menuSpan);

                        //add item to list
                        extended_menuItemsList.appendChild(extended_menuItem);

                        kindle_menuNode.appendChild(extended_menuSection);
                        kindle_menuNode.appendChild(extended_menuItemsList)

                        // const menuNode = document.querySelector('ul.kw-rd-hamburger-items-list');
                        // menuNode.appendChild(extended_menuItem);

                        //menuNode.firstChild.addEventListener('click', function(event){ alert(event); }, false);
                    }

                    if (node.id === 'bookInfo') {
                        let bookInfoJson = JSON.parse(node.text);
                        if (typeof GM_getValue(amazonKindleId+'navigationDirection') !== 'undefined') {
                            bookInfoJson.contentMetadata.navigationDirection = GM_getValue(amazonKindleId+'navigationDirection');
                            node.text = JSON.stringify(bookInfoJson);
                            console.log(`kindle navigation Direction set to : ${bookInfoJson.contentMetadata.navigationDirection}`);
                        }
                        
                        //console.log(`navigationDirection: ${bookInfoJson.contentMetadata.navigationDirection}`);
                        // if (GM_getValue('switchDirection') == true) {
                        //     bookInfoJson.contentMetadata.navigationDirection = bookInfoJson.contentMetadata.navigationDirection.split("").reverse().join("");
                        //     console.log(`navigationDirection: ${bookInfoJson.contentMetadata.navigationDirection}`);
                        // }
                        //bookInfoJson.contentMetadata.navigationDirection = 'lr';
                        //console.log(`navigationDirection: ${bookInfoJson.contentMetadata.navigationDirection}`);
                        //node.text = JSON.stringify(bookInfoJson);
                    }
                }
            }
        }
    };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);


})();