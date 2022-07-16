// ==UserScript==
// @name         Kindle manga/comic beta web reader enhancements
// @namespace    http://alvaromunoz.cl/
// @version      1.0.4
// @description  Adds enhancements to the kindle manga/comic beta web reader
// @author       Álvaro Muñoz
// @match        https://read.amazon.com/manga/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-body
// ==/UserScript==

(function () {
  "use strict";

  const emojiDict = {
    lr: "➡️",
    rl: "⬅️",
  };

  //Get ID to save per book!
  const regex = /\/(\w+)\?/;
  const amazonKindleId = document
    .querySelector('meta[property="og:url"]')
    .content.match(regex)[1];
  console.log(`amazon kindle id: ${amazonKindleId}`);

  // Select the node that will be observed for mutations
  const targetNode = document.querySelector("body");
  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };
  // Callback function to execute when mutations are observed
  const callback = function (mutationList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        //console.log('A child node has been added or removed.');
        for (let node of mutation.addedNodes) {
          //console.log('A child node has been added or removed: ' + node.nodeName);
          if (node.id === "readerHamburgerMenu") {
            if (
              typeof GM_getValue(amazonKindleId + "navigationDirection") ===
              "undefined"
            ) {
              GM_setValue(
                amazonKindleId + "navigationDirection",
                JSON.parse(document.getElementById("bookInfo").text)
                  .contentMetadata.navigationDirection
              );
            }
            const currentDirection = GM_getValue(
              amazonKindleId + "navigationDirection"
            );
            const reverseDirection = currentDirection
              .split("")
              .reverse()
              .join("");

            let kindle_menuNode = document.getElementById(
              "readerHamburgerMenuContent"
            );

            // SECTION
            const extended_menuSectionInnerText =
              document.createTextNode(`Extended Menu`);
            const extended_menuSectionInner = document.createElement("div");
            extended_menuSectionInner.setAttribute(
              "class",
              "kw-rd-hamburger-section-inner"
            );
            extended_menuSectionInner.append(extended_menuSectionInnerText);

            const extended_menuSection = document.createElement("div");
            extended_menuSection.setAttribute(
              "class",
              "kw-row kw-rd-hamburger-section"
            );
            extended_menuSection.append(extended_menuSectionInner);

            //LIST
            const extended_menuItemsList = document.createElement("ul");
            extended_menuItemsList.setAttribute(
              "class",
              "kw-rd-hamburger-items-list"
            );

            //ITEM
            const extended_menuItemText = document.createTextNode(
              `Switch reading direction to ${emojiDict[reverseDirection]}`
            );

            const extended_menuItemLink = document.createElement("a");
            extended_menuItemLink.setAttribute("class", "kw-text-normal");
            extended_menuItemLink.setAttribute("href", "#");
            extended_menuItemLink.setAttribute(
              "id",
              "readerHamburgerSwitchDirection"
            );
            extended_menuItemLink.addEventListener(
              "click",
              function (event) {
                console.log(`Switching direction! to ${reverseDirection}`);
                GM_setValue(
                  amazonKindleId + "navigationDirection",
                  reverseDirection
                );
                window.location.reload(true);
              },
              false
            );
            extended_menuItemLink.appendChild(extended_menuItemText);

            const extended_menuItemInner = document.createElement("div");
            extended_menuItemInner.setAttribute(
              "class",
              "kw-rd-hamburger-item-inner"
            );
            extended_menuItemInner.appendChild(extended_menuItemLink);

            const extended_menuSpan = document.createElement("span");
            extended_menuSpan.setAttribute("class", "kw-list-item");
            extended_menuSpan.appendChild(extended_menuItemInner);

            const extended_menuItem = document.createElement("li");
            extended_menuItem.setAttribute("class", "kw-rd-hamburger-item");
            extended_menuItem.appendChild(extended_menuSpan);

            //add item to list
            extended_menuItemsList.appendChild(extended_menuItem);

            //add section and list to end of menu
            kindle_menuNode.appendChild(extended_menuSection);
            kindle_menuNode.appendChild(extended_menuItemsList);
          }

          // Modify bookInfo
          if (node.id === "bookInfo") {
            let bookInfoJson = JSON.parse(node.text);

            if (
              typeof GM_getValue(amazonKindleId + "navigationDirection") !==
              "undefined"
            ) {
              bookInfoJson.contentMetadata.navigationDirection = GM_getValue(
                amazonKindleId + "navigationDirection"
              );
              node.text = JSON.stringify(bookInfoJson);
              console.log(
                `kindle navigation Direction set to : ${bookInfoJson.contentMetadata.navigationDirection}`
              );
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
