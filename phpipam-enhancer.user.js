// ==UserScript==
// @name         phpipam-enhancer
// @namespace    https://github.com/babs/phpipam-enhancer.user.js
// @version      0.8
// @downloadURL  https://github.com/babs/phpipam-enhancer.user.js/raw/main/phpipam-enhancer.user.js
// @updateURL    https://github.com/babs/phpipam-enhancer.user.js/raw/main/phpipam-enhancer.user.js
// @description  Enhance phpipam subnet view by adding http and https links to ips and hostnames
// @author       Damien Degois
// @match        http*://*/subnets/*
// @match        http*://*/tools/search/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var enhancements = [
        {
            'getElements': () => document.querySelectorAll('td[class*=hostname]'),
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length < 1 || e.childNodes[0].nodeType != XMLDocument.TEXT_NODE;
            },
        },
        {
            'getElements': () => document.querySelectorAll('td[class*=ipaddress]'),
            'valueidx': 1,
            'check_cb': (e) => {
                return e.childNodes.length < 2 || e.childNodes[1].tagName != 'A';
            },
        },
        {
            'getElements': () => document.querySelectorAll('[class=ip]'),
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length < 1 || e.childNodes[0].tagName != 'A';
            },
        },
        {
            'getElements': () => document.querySelectorAll('tr[class=ipSearch]>:nth-child(3)'),
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length < 1 || e.childNodes[0].nodeType != XMLDocument.TEXT_NODE;
            },
        },
        {
            'getElements': () => document.evaluate("//th[text()='Gateway']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.childNodes,
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length < 1 || e.childNodes[0].nodeType != XMLDocument.TEXT_NODE;
            },
            'http_links': false,
        },
        {
            'getElements': () => document.querySelectorAll('span[class=subnet_badge]'),
            'valueidx': 0,
            'check_cb': (e) => {
                return false;
            },
            'http_links': false,
        },
    ]

    let extend_element_with_helper = (element, value, http_links) => {
        let value_for_links = value;
        if (value.indexOf('::') !== false || value.split(':').length > 2) {
            value_for_links = '['+value+']';
        }

        let httplink = document.createElement('a');
        httplink.href = 'http://'+value;
        httplink.text = 'http';
        httplink.target = '_blank';

        let httpslink = document.createElement('a');
        httpslink.href = 'https://'+value;
        httpslink.text = 'https';
        httpslink.target = '_blank';

        let copylink = document.createElement('a');
        copylink.href = 'javascript:copyToClip("'+value+'");void(0)';
        copylink.text = 'copy';

        element.appendChild(document.createTextNode(' [\u00A0'));
        if (http_links == undefined || http_links) {
            element.appendChild(httplink);
            element.appendChild(document.createTextNode('\u00A0|\u00A0'));
            element.appendChild(httpslink);
            element.appendChild(document.createTextNode('\u00A0|\u00A0'));
        }
        element.appendChild(copylink);
        element.appendChild(document.createTextNode('\u00A0] '));

    }

    enhancements.forEach(enh => {
        try {
            for (let e of enh.getElements()) {
                if (enh.check_cb(e)) {
                    continue;
                }
                let value = e.childNodes[enh.valueidx].textContent.trim();
                if (value == "") {
                    continue;
                }
                extend_element_with_helper(e, value, enh.http_links);
            }
        } catch(e) {
            console.log('something whent wrong while processing ' + enh.getElements + ': ' + e);
        }
    });
    let script_elem = document.createElement('script');
    script_elem.text = `
            function copyToClip(str) {
                function listener(e) {
                  e.clipboardData.setData("text/html", str);
                  e.clipboardData.setData("text/plain", str);
                  e.preventDefault();
                }
                document.addEventListener("copy", listener);
                document.execCommand("copy");
                document.removeEventListener("copy", listener);
              };
`
    document.body.appendChild(script_elem);
})();
