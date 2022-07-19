// ==UserScript==
// @name         Kindle manga/comic beta web reader enhancements
// @namespace    http://alvaromunoz.cl/
// @version      1.1.0
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

    //Get ID to save per book!
    const regex = /\/(\w+)\?/;
    const amazonKindleId = document.querySelector('meta[property="og:url"]').content.match(regex)[1];
    console.log(`amazon kindle id: ${amazonKindleId}`);

    const emojiDict = {
        lr: '➡️',
        rl: '⬅️',
    };

    function addToHamburgerDiv(element) {
        let extended_menuItemInner = document.createElement('div');
        extended_menuItemInner.setAttribute('class', 'kw-rd-hamburger-item-inner');
        extended_menuItemInner.appendChild(element);
        let extended_menuSpan = document.createElement('span');
        extended_menuSpan.setAttribute('class', 'kw-list-item');
        extended_menuSpan.appendChild(extended_menuItemInner);
        let extended_menuItem = document.createElement('li');
        extended_menuItem.setAttribute('class', 'kw-rd-hamburger-item');
        extended_menuItem.appendChild(extended_menuSpan);
        return extended_menuItem;
    }

    function createMenuLinkItem(menuText, menuId, func) {
        let extended_menuItemText = document.createTextNode(menuText);
        let extended_menuItemLink = document.createElement('a');
        extended_menuItemLink.setAttribute('class', 'kw-text-normal');
        extended_menuItemLink.setAttribute('href', '#');
        extended_menuItemLink.setAttribute('id', menuId);
        extended_menuItemLink.addEventListener('click', func, false);
        extended_menuItemLink.appendChild(extended_menuItemText);

        return addToHamburgerDiv(extended_menuItemLink);
    }

    function createMenuRangeItem(labelText, menuId, int_min, int_max, int_value, func) {
        let extended_menuItemText = document.createTextNode(labelText);
        let extended_menuItemLabel = document.createElement('label');
        extended_menuItemLabel.setAttribute('for', menuId);
        extended_menuItemLabel.appendChild(extended_menuItemText);
        let extended_menuItemInputRange = document.createElement('input');
        extended_menuItemInputRange.setAttribute('type', 'range');
        extended_menuItemInputRange.setAttribute('id', menuId);
        extended_menuItemInputRange.setAttribute('name', menuId);
        extended_menuItemInputRange.setAttribute('min', int_min);
        extended_menuItemInputRange.setAttribute('max', int_max);
        extended_menuItemInputRange.setAttribute('step', '0.05');
        extended_menuItemInputRange.setAttribute('value', int_value);
        extended_menuItemInputRange.addEventListener('input', func, false);

        let extended_menuItemValueDiv = document.createElement('div');
        extended_menuItemValueDiv.setAttribute('id', 'value');
        let extended_menuItemValueText = document.createTextNode(int_value);
        extended_menuItemValueDiv.appendChild(extended_menuItemValueText);

        let extended_menuItemForm = document.createElement('form');
        extended_menuItemForm.setAttribute('class', 'kw-button-inner');
        extended_menuItemForm.setAttribute('action', '#');
        extended_menuItemForm.appendChild(extended_menuItemLabel);
        extended_menuItemForm.appendChild(extended_menuItemInputRange);
        extended_menuItemForm.appendChild(extended_menuItemValueDiv);

        return addToHamburgerDiv(extended_menuItemForm);
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

    function updateCanvasFilters() {
        document.querySelector('#renderContainer').querySelector('canvas').style.filter = `brightness(${GM_getValue(
            amazonKindleId + 'brightness'
        )}) contrast(${GM_getValue(amazonKindleId + 'contrast')})`;
    }

    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = function (mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    // Set default values
                    if (node.id === 'bookInfo') {
                        // Set default navigationDirection value
                        if (typeof GM_getValue(amazonKindleId + 'navigationDirection') === 'undefined') {
                            GM_setValue(
                                amazonKindleId + 'navigationDirection',
                                JSON.parse(document.getElementById('bookInfo').text).contentMetadata.navigationDirection
                            );
                        }

                        // Set default brightness value
                        if (typeof GM_getValue(amazonKindleId + 'brightness') === 'undefined') {
                            GM_setValue(amazonKindleId + 'brightness', '1');
                        }

                        // Set default contrast value
                        if (typeof GM_getValue(amazonKindleId + 'contrast') === 'undefined') {
                            GM_setValue(amazonKindleId + 'contrast', '1');
                        }
                    }

                    // Edit Hamburger Menu
                    if (node.id === 'readerHamburgerMenu') {
                        // Get menuNode
                        let kindle_menuNode = document.getElementById('readerHamburgerMenuContent');

                        // Set reading directions variables
                        let currentDirection = GM_getValue(amazonKindleId + 'navigationDirection');
                        let reverseDirection = currentDirection.split('').reverse().join('');

                        // Create Section
                        let extended_menuSection = createMenuSection('EXTENDED MENU');

                        // Create List
                        let extended_menuItemsList = createMenuList();

                        let extended_directionItem = createMenuLinkItem(
                            `${emojiDict[reverseDirection]} switch reading direction (refreshes page)`,
                            'readerHamburgerSwitchDirection',
                            function (event) {
                                console.log(`Switching direction! to ${reverseDirection}`);
                                GM_setValue(amazonKindleId + 'navigationDirection', reverseDirection);
                                window.location.reload(true);
                            }
                        );

                        let extended_brightnessRangeItem = createMenuRangeItem(
                            '☀️ Brightness: ',
                            'ext_brightness',
                            '0',
                            '2',
                            parseFloat(GM_getValue(amazonKindleId + 'brightness')).toFixed(2),
                            function (event) {
                                let brightness = event.currentTarget.valueAsNumber;
                                GM_setValue(amazonKindleId + 'brightness', brightness);
                                event.currentTarget.parentNode.querySelector('#value').textContent = brightness.toFixed(2);
                                updateCanvasFilters();
                            }
                        );

                        let extended_contrastRangeItem = createMenuRangeItem(
                            '🌗 Contrast: ',
                            'ext_contrast',
                            '0',
                            '2',
                            parseFloat(GM_getValue(amazonKindleId + 'contrast')).toFixed(2),
                            function (event) {
                                let contrast = event.currentTarget.valueAsNumber;
                                GM_setValue(amazonKindleId + 'contrast', contrast);
                                event.currentTarget.parentNode.querySelector('#value').textContent = contrast.toFixed(2);
                                updateCanvasFilters();
                            }
                        );

                        // Add items to list
                        extended_menuItemsList.appendChild(extended_directionItem);
                        extended_menuItemsList.appendChild(extended_brightnessRangeItem);
                        extended_menuItemsList.appendChild(extended_contrastRangeItem);

                        // Add section and list to end of menu
                        kindle_menuNode.appendChild(extended_menuSection);
                        kindle_menuNode.appendChild(extended_menuItemsList);
                    }

                    // Apply Canvas filters
                    if (node.nodeName.toUpperCase() === 'CANVAS') {
                        updateCanvasFilters();
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
