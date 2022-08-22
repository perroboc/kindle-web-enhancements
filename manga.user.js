// ==UserScript==
// @name         Kindle manga/comic beta web reader enhancements
// @namespace    http://alvaromunoz.cl/
// @version      1.1.1
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
        extended_menuItemLabel.setAttribute('class', 'kw-text-normal');
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

    var extendedMenuActivated = false;

    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = function (mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.id === 'reader' && node.innerHTML !== '') {
                        // Create extended settings button
                        let settingsMenuNode = document.createElement('div');
                        settingsMenuNode.setAttribute('class', 'kw-rd-chrome-settings-t1');

                        let settingsMenuButton = document.createElement('button');
                        settingsMenuButton.setAttribute('class', 'kw-rd-chrome-settings-btn');
                        settingsMenuButton.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                <!-- https://phabricator.wikimedia.org/diffusion/GOJU/browse/master/AUTHORS.txt, MIT <http://opensource.org/licenses/mit-license.php>, via Wikimedia Commons -->
                                <g id="ext-settings">
                                    <path id="gear" d="M3 4h3v2H3zm9 0h9v2h-9zM8 3h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm-5 8h9v2H3zm15 0h3v2h-3zm-4-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zM3 18h6v2H3zm12 0h6v2h-6zm-4-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" style="--darkreader-inline-fill:#e8e6e3;" fill-rule="evenodd" fill="#000000" data-darkreader-inline-fill=""></path>
                                </g>
                            </svg>`;

                        // Add menu show/hide function
                        settingsMenuButton.addEventListener(
                            'click',
                            function (event) {
                                let extended_menu = document.createElement('div');
                                extended_menu.setAttribute('class', 'kw-rd-dot-menu');
                                extended_menu.setAttribute('id', 'readerExtendedSettingsMenu');

                                let extended_menuContent = document.createElement('div');
                                extended_menuContent.setAttribute('class', 'kw-rd-hamburger-menu-content');
                                extended_menuContent.setAttribute('id', 'readerExtendedSettingsMenuContent');

                                extended_menu.appendChild(extended_menuContent);

                                extendedMenuActivated = !extendedMenuActivated;
                                if (extendedMenuActivated) {
                                    console.log('showing menu');
                                    event.currentTarget.parentNode.appendChild(extended_menu);
                                } else {
                                    console.log('hiding menu');
                                    event.currentTarget.parentNode.querySelector('#readerExtendedSettingsMenu').remove();
                                }
                            },
                            false
                        );
                        settingsMenuNode.appendChild(settingsMenuButton);

                        // Insert before everything in the top right menu
                        node.querySelector('.kw-rd-chrome-right').insertBefore(
                            settingsMenuNode,
                            node.querySelector('.kw-rd-chrome-right').firstChild
                        );
                    }

                    // Set userscript default values
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

                    // Edit readerExtendedSettingsMenu Menu
                    if (node.id === 'readerExtendedSettingsMenu') {
                        // Get menuNode
                        let kindle_menuNode = node.querySelector('#readerExtendedSettingsMenuContent');

                        // Set reading directions variables
                        let currentDirection = GM_getValue(amazonKindleId + 'navigationDirection');
                        let reverseDirection = currentDirection.split('').reverse().join('');

                        // Create Section
                        let extended_menuSection = createMenuSection('EXTENDED MENU');

                        // Create List
                        let extended_menuItemsList = createMenuList();

                        let extended_directionItem = createMenuLinkItem(
                            `${emojiDict[reverseDirection]} Switch reading direction (refreshes page)`,
                            'readerHamburgerSwitchDirection',
                            function (event) {
                                console.log(`Switching direction! to ${reverseDirection}`);
                                GM_setValue(amazonKindleId + 'navigationDirection', reverseDirection);
                                window.location.reload(true);
                            }
                        );

                        let extended_brightnessRangeItem = createMenuRangeItem(
                            '☀️ Adjust Brightness: ',
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
                            '🌗 Adjust Contrast: ',
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
