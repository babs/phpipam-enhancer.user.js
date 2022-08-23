// ==UserScript==
// @name         phpipam-enhancer
// @namespace    https://gist.github.com/babs/0dcd4ca7e5eb495191caf8a28b9ffb7c
// @version      0.6
// @downloadURL  https://gist.github.com/babs/0dcd4ca7e5eb495191caf8a28b9ffb7c/raw/phpipam-enhancer.user.js
// @updateURL    https://gist.github.com/babs/0dcd4ca7e5eb495191caf8a28b9ffb7c/raw/phpipam-enhancer.user.js
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
            'query': '[class*=hostname]',
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length != 1 || e.childNodes[0].nodeType != XMLDocument.TEXT_NODE;
            }
        },
        {
            'query': '[class*=ipaddress]',
            'valueidx': 1,
            'check_cb': (e) => {
                return e.childNodes.length < 2 || e.childNodes[1].tagName != 'A';
            }
        },
        {
            'query': '[class=ip]',
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length < 1 || e.childNodes[0].tagName != 'A';
            }
        },
        {
            'query': 'tr[class=ipSearch]>:nth-child(3)',
            'valueidx': 0,
            'check_cb': (e) => {
                return e.childNodes.length < 1 || e.childNodes[0].nodeType != XMLDocument.TEXT_NODE;
            }
        },
    ]

    enhancements.forEach( enh => {
        for (let e of document.querySelectorAll(enh.query)) {
            if (enh.check_cb(e)) {
                continue;
            }
            let value = e.childNodes[enh.valueidx].textContent.trim();
            if (value == "") {
                continue;
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

            e.appendChild(document.createTextNode(' [ '));
            e.appendChild(httplink);
            e.appendChild(document.createTextNode(' | '));
            e.appendChild(httpslink);
            e.appendChild(document.createTextNode(' | '));
            e.appendChild(copylink);
            e.appendChild(document.createTextNode(' ] '));
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
