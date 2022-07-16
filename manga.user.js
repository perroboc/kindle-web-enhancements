// ==UserScript==
// @name         Kindle manga/comic beta web reader enhancements
// @namespace    http://alvaromunoz.cl/
// @version      1.0.5
// @description  Adds enhancements to the kindle manga/comic beta web reader
// @author       Álvaro Muñoz
// @match        https://read.amazon.com/manga/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict';

    const emojiDict = {
        lr: '➡️',
        rl: '⬅️',
    };

    function createMenuItem(menuText, menuId, func) {
        let extended_menuItemText = document.createTextNode(menuText);
        let extended_menuItemLink = document.createElement('a');
        extended_menuItemLink.setAttribute('class', 'kw-text-normal');
        extended_menuItemLink.setAttribute('href', '#');
        extended_menuItemLink.setAttribute('id', menuId);
        extended_menuItemLink.addEventListener('click', func, false);
        extended_menuItemLink.appendChild(extended_menuItemText);
        let extended_menuItemInner = document.createElement('div');
        extended_menuItemInner.setAttribute('class', 'kw-rd-hamburger-item-inner');
        extended_menuItemInner.appendChild(extended_menuItemLink);
        let extended_menuSpan = document.createElement('span');
        extended_menuSpan.setAttribute('class', 'kw-list-item');
        extended_menuSpan.appendChild(extended_menuItemInner);
        let extended_menuItem = document.createElement('li');
        extended_menuItem.setAttribute('class', 'kw-rd-hamburger-item');
        extended_menuItem.appendChild(extended_menuSpan);
        return extended_menuItem;
    }

    function createMenuSection(sectionText) {
        let extended_menuSectionInnerText = document.createTextNode(sectionText);
        let extended_menuSectionInner = document.createElement('div');
        extended_menuSectionInner.setAttribute('class', 'kw-rd-hamburger-section-inner');
        extended_menuSectionInner.append(extended_menuSectionInnerText);
        let extended_menuSection = document.createElement('div');
        extended_menuSection.setAttribute('class', 'kw-row kw-rd-hamburger-section');
        extended_menuSection.append(extended_menuSectionInner);
        return extended_menuSection;
    }

    function createMenuList() {
        let extended_menuItemsList = document.createElement('ul');
        extended_menuItemsList.setAttribute('class', 'kw-rd-hamburger-items-list');
        return extended_menuItemsList;
    }

    //Get ID to save per book!
    const regex = /\/(\w+)\?/;
    const amazonKindleId = document.querySelector('meta[property="og:url"]').content.match(regex)[1];
    console.log(`amazon kindle id: ${amazonKindleId}`);

    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = function (mutationList, observer) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                // console.log('A child node has been added or removed.');
                for (let node of mutation.addedNodes) {
                    // console.log('A child node has been added or removed: ' + node.nodeName);

                    // Edit Hamburger Menu
                    if (node.id === 'readerHamburgerMenu') {
                        // Get amazon book ID
                        if (typeof GM_getValue(amazonKindleId + 'navigationDirection') === 'undefined') {
                            GM_setValue(
                                amazonKindleId + 'navigationDirection',
                                JSON.parse(document.getElementById('bookInfo').text).contentMetadata.navigationDirection
                            );
                        }

                        // Set reading directions variables
                        let currentDirection = GM_getValue(amazonKindleId + 'navigationDirection');
                        let reverseDirection = currentDirection.split('').reverse().join('');

                        // Create menuNode
                        let kindle_menuNode = document.getElementById('readerHamburgerMenuContent');

                        // Create Section
                        let extended_menuSection = createMenuSection('EXTENDED MENU');

                        // Create List
                        let extended_menuItemsList = createMenuList();

                        // Create Item
                        let extended_menuItem = createMenuItem(
                            `Switch reading direction to ${emojiDict[reverseDirection]}`,
                            'readerHamburgerSwitchDirection',
                            function (event) {
                                console.log(`Switching direction! to ${reverseDirection}`);
                                GM_setValue(amazonKindleId + 'navigationDirection', reverseDirection);
                                window.location.reload(true);
                            }
                        );

                        // Add item to list
                        extended_menuItemsList.appendChild(extended_menuItem);

                        // Add section and list to end of menu
                        kindle_menuNode.appendChild(extended_menuSection);
                        kindle_menuNode.appendChild(extended_menuItemsList);
                    }

                    // Modify bookInfo
                    if (node.id === 'bookInfo') {
                        let bookInfoJson = JSON.parse(node.text);

                        // Change navigation direction to saved value
                        if (typeof GM_getValue(amazonKindleId + 'navigationDirection') !== 'undefined') {
                            bookInfoJson.contentMetadata.navigationDirection = GM_getValue(amazonKindleId + 'navigationDirection');
                            node.text = JSON.stringify(bookInfoJson);
                        }
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
