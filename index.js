/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2021 Taufik Nurrohman <https://github.com/taufik-nurrohman>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.TE = global.TE || {}, global.TE.SourceHTML = {})));
})(this, function(exports) {
    'use strict';
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isDefined = function isDefined(x) {
        return 'undefined' !== typeof x;
    };
    var isFunction = function isFunction(x) {
        return 'function' === typeof x;
    };
    var isInstance = function isInstance(x, of ) {
        return x && isSet( of ) && x instanceof of ;
    };
    var isNull = function isNull(x) {
        return null === x;
    };
    var isObject = function isObject(x, isPlain) {
        if (isPlain === void 0) {
            isPlain = true;
        }
        if ('object' !== typeof x) {
            return false;
        }
        return isPlain ? isInstance(x, Object) : true;
    };
    var isSet = function isSet(x) {
        return isDefined(x) && !isNull(x);
    };
    var isString = function isString(x) {
        return 'string' === typeof x;
    };
    var fromHTML = function fromHTML(x) {
        return x.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
    };
    var fromValue = function fromValue(x) {
        if (isArray(x)) {
            return x.map(function(v) {
                return fromValue(x);
            });
        }
        if (isObject(x)) {
            for (var k in x) {
                x[k] = fromValue(x[k]);
            }
            return x;
        }
        if (false === x) {
            return 'false';
        }
        if (null === x) {
            return 'null';
        }
        if (true === x) {
            return 'true';
        }
        return "" + x;
    };
    var toCount = function toCount(x) {
        return x.length;
    };
    var isPattern = function isPattern(pattern) {
        return isInstance(pattern, RegExp);
    };
    var toPattern = function toPattern(pattern, opt) {
        if (isPattern(pattern)) {
            return pattern;
        } // No need to escape `/` in the pattern string
        pattern = pattern.replace(/\//g, '\\/');
        return new RegExp(pattern, isSet(opt) ? opt : 'g');
    };
    var tagStart$1 = function tagStart(name) {
            return '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>';
        },
        tagEnd$1 = function tagEnd(name) {
            return '</(' + name + ')>';
        };
    var that = {};

    function toAttributes$1(attributes) {
        var attribute,
            out = "";
        for (attribute in attributes) {
            out += ' ' + attribute + '="' + fromHTML(fromValue(attributes[attribute])) + '"';
        }
        return out;
    }
    that.toggle = function(name, content, attributes, tidy) {
        if (content === void 0) {
            content = "";
        }
        if (attributes === void 0) {
            attributes = {};
        }
        if (tidy === void 0) {
            tidy = false;
        }
        var t = this,
            _t$$ = t.$(),
            after = _t$$.after,
            before = _t$$.before,
            value = _t$$.value,
            tagStartLocal = tagStart$1(name),
            tagEndLocal = tagEnd$1(name),
            tagStartLocalPattern = toPattern(tagStartLocal + '$', ""),
            tagEndLocalPattern = toPattern('^' + tagEndLocal, ""),
            tagStartLocalMatch = tagStartLocalPattern.test(before),
            tagEndLocalMatch = tagEndLocalPattern.test(after);
        if (tagEndLocalMatch && tagStartLocalMatch) {
            return t.replace(tagEndLocalPattern, "", 1).replace(tagStartLocalPattern, "", -1);
        }
        tagStartLocalPattern = toPattern('^' + tagStartLocal, "");
        tagEndLocalPattern = toPattern(tagEndLocal + '$', "");
        tagStartLocalMatch = tagStartLocalPattern.test(value);
        tagEndLocalMatch = tagEndLocalPattern.test(value);
        if (tagEndLocalMatch && tagStartLocalMatch) {
            t.insert(value = value.replace(tagEndLocalPattern, "").replace(tagStartLocalPattern, ""));
        }
        if (!value && content) {
            t.insert(content);
        }
        if (false !== tidy) {
            if (true === tidy) {
                tidy = ["", ""];
            }
            if (isString(tidy)) {
                tidy = [tidy, tidy];
            }
            t.trim(tidy[0], tidy[1] || tidy[0]);
        }
        return t.wrap('<' + name + toAttributes$1(attributes) + '>', '</' + name + '>');
    };
    const defaults = {
        source: {
            type: 'HTML'
        },
        sourceHTML: {
            elements: {
                a: ['a', 'link text goes here…', {}],
                area: ['area', false, {}],
                b: ['strong', 'text goes here…', {}],
                base: ['base', false, {
                    href: ""
                }, '\n'],
                blockquote: ['blockquote', "", {}, '\n'],
                br: ['br', false, {},
                    ["", '\n']
                ],
                button: ['button', 'text goes here…', {
                    name: "",
                    type: 'submit'
                }, ' '],
                caption: ['caption', 'caption goes here…', {}, '\n'],
                code: ['code', 'code goes here…', {}, ' '],
                col: ['col', false, {}, '\n'],
                em: ['em', 'text goes here…', {}],
                figcaption: ['figcaption', 'caption goes here…', {}, '\n'],
                figure: ['figure', "", {}, '\n'],
                h1: ['h1', 'title goes here…', {}, '\n'],
                h2: ['h2', 'title goes here…', {}, '\n'],
                h3: ['h3', 'title goes here…', {}, '\n'],
                h4: ['h4', 'title goes here…', {}, '\n'],
                h5: ['h5', 'title goes here…', {}, '\n'],
                h6: ['h6', 'title goes here…', {}, '\n'],
                hr: ['hr', false, {}, '\n'],
                i: ['em', 'text goes here…', {}],
                img: ['img', false, {
                    alt: "",
                    src: ""
                }, ' '],
                input: ['input', false, {
                    name: "",
                    type: 'text'
                }, ' '],
                li: ['li', 'list item goes here…', {}, '\n'],
                link: ['link', false, {
                    href: ""
                }, '\n'],
                meta: ['meta', false, {}, '\n'],
                ol: ['ol', "", {}, '\n'],
                option: ['option', 'option goes here…', {}, '\n'],
                p: ['p', 'paragraph goes here…', {}, '\n'],
                param: ['param', false, {
                    name: ""
                }, '\n'],
                pre: ['pre', 'text goes here…', {}, '\n'],
                script: ['script', "", {}, '\n'],
                select: ['select', "", {
                    name: ""
                }, ' '],
                source: ['source', false, {
                    src: ""
                }, '\n'],
                strong: ['strong', 'text goes here…', {}],
                style: ['style', "", {}, '\n'],
                td: ['td', 'data goes here…', {}, '\n'],
                textarea: ['textarea', 'text goes here…', {
                    name: ""
                }, ' '],
                th: ['th', 'title goes here…', {}, '\n'],
                tr: ['tr', "", {}, '\n'],
                track: ['track', false, {}, '\n'],
                u: ['u', 'text goes here…', {}],
                ul: ['ul', "", {}, '\n'],
                wbr: ['wbr', false, {},
                    ["", '\n']
                ]
            }
        }
    };
    const {
        toggle
    } = that;
    let tagName = '[\\w:.-]+',
        tagStart = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>',
        tagEnd = name => '</(' + name + ')>';

    function toAttributes(attributes) {
        if (!attributes) {
            return "";
        }
        let attribute,
            out = "";
        for (attribute in attributes) {
            out += ' ' + attribute + '="' + fromHTML(fromValue(attributes[attribute])) + '"';
        }
        return out;
    }

    function toTidy(tidy) {
        if (false !== tidy) {
            if (isString(tidy)) {
                tidy = [tidy, tidy];
            } else if (!isArray(tidy)) {
                tidy = ["", ""];
            }
            if (!isSet(tidy[1])) {
                tidy[1] = tidy[0];
            }
        }
        return tidy; // Return `[…]` or `false`
    }

    function toggleBlocks(editor) {
        let patternBefore = /<(?:h([1-6])|p)(\s[^>]*)?>$/,
            patternAfter = /^<\/(?:h[1-6]|p)>/;
        editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
            let t = this,
                h = +(before[1] || 0),
                attr = before[2] || "",
                elements = editor.state.sourceHTML.elements || {},
                element = before[0] ? elements[before[0].slice(1, -1).split(/\s/)[0]] : ["", "", {},
                    ["", ""]
                ];
            if (!attr && element[2]) {
                attr = toAttributes(element[2]);
            } // ``
            t.replace(patternBefore, "", -1);
            t.replace(patternAfter, "", 1);
            let tidy = element[3];
            if (false !== (tidy = toTidy(tidy))) {
                t.trim(tidy[0], tidy[1]);
            }
            if (!h) {
                // `<h1>`
                t.wrap('<' + elements.h1[0] + (attr || toAttributes(elements.h1[2])) + '>', '</' + elements.h1[0] + '>');
                if (!value[0] || value[0] === elements.p[1]) {
                    t.insert(elements.h1[1]);
                }
            } else {
                ++h;
                if (h > 6) {
                    // `<p>`
                    t.wrap('<' + elements.p[0] + (attr || toAttributes(elements.p[2])) + '>', '</' + elements.p[0] + '>');
                    if (!value[0] || value[0] === elements.h6[1]) {
                        t.insert(elements.p[1]);
                    }
                } else {
                    // `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
                    t.wrap('<' + elements['h' + h][0] + (attr || toAttributes(elements['h' + h][2])) + '>', '</' + elements['h' + h][0] + '>');
                    if (!value[0] || value[0] === elements.p[1]) {
                        t.insert(elements['h' + h][1]);
                    }
                }
            }
        });
    }

    function toggleCodes(editor) {
        let patternBefore = /<(?:pre|code)(?:\s[^>]*)?>(?:\s*<code(?:\s[^>]*)?>)?$/,
            patternAfter = /^(?:<\/code>\s*)?<\/(?:pre|code)>/;
        editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
            let t = this,
                tidy,
                elements = editor.state.sourceHTML.elements,
                attrCode = toAttributes(elements.code[2]),
                attrPre = toAttributes(elements.pre[2]); // ``
            t.replace(patternBefore, "", -1);
            t.replace(patternAfter, "", 1);
            if (after[0]) {
                // ``
                if (/^(?:<\/code>\s*)?<\/pre>/.test(after[0])) {
                    t.trim("", "").insert(decode(editor.$().value)); // `<pre><code> … </code></pre>`
                } else if (after[0].slice(0, 7) === '</' + elements.code[0] + '>') {
                    tidy = elements.pre[3];
                    if (false !== (tidy = toTidy(tidy))) {
                        t.trim(tidy[0], tidy[1]);
                    }
                    t.wrap('<' + elements.pre[0] + attrPre + '><' + elements.code[0] + attrCode + '>', '</' + elements.code[0] + '></' + elements.pre[0] + '>');
                } // `<code> … </code>`
            } else {
                tidy = elements.code[3];
                if (false !== (tidy = toTidy(tidy))) {
                    t.trim(tidy[0], tidy[1]);
                }
                t.wrap('<' + elements.code[0] + attrCode + '>', '</' + elements.code[0] + '>').insert(encode(editor.$().value || elements.code[1]));
            }
        });
    }

    function encode(x) {
        return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function decode(x) {
        return x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }

    function canKeyDown(key, {
        a,
        c,
        s
    }, that) {
        let state = that.state,
            charIndent = state.sourceHTML.tab || state.tab || '\t',
            elements = state.sourceHTML.elements || {},
            prompt = state.source.prompt;
        if (c) {
            let {
                after,
                before,
                end,
                start,
                value
            } = that.$(),
                lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop(),
                lineMatch = lineBefore.match(/^(\s+)/),
                lineMatchIndent = lineMatch && lineMatch[1] || "";
            if ('b' === key) {
                return toggle.apply(that, elements.b), false;
            }
            if ('g' === key) {
                if (isFunction(prompt)) {
                    let src = prompt('URL:', value && /^https?:\/\/\S+$/.test(value) ? value : 'http://');
                    if (src) {
                        if (value) {
                            elements.img[2].alt = value;
                            that.record(); // Record selection
                        }
                        let tidy = elements.img[3] || false;
                        if (false !== (tidy = toTidy(tidy))) {
                            that.trim(tidy[0], "");
                        }
                        elements.img[2].src = src;
                        if ((!after || '\n' === after[0]) && (!before || '\n' === before.slice(-1))) {
                            tidy = elements.figure[3] || false;
                            if (false !== (tidy = toTidy(tidy))) {
                                that.trim(tidy[0], tidy[1]);
                            }
                            that.insert("");
                            that.wrap(lineMatchIndent + '<' + elements.figure[0] + toAttributes(elements.figure[2]) + '>\n' + lineMatchIndent + charIndent, lineMatchIndent + '\n</' + elements.figure[0] + '>');
                            that.insert('<' + elements.img[0] + toAttributes(elements.img[2]) + '>\n' + lineMatchIndent + charIndent, -1);
                            that.wrap('<' + elements.figcaption[0] + toAttributes(elements.figcaption[2]) + '>', '</' + elements.figcaption[0] + '>').insert(elements.figcaption[1]);
                        } else {
                            that.insert('<' + elements.img[0] + toAttributes(elements.img[2]) + '>' + (false !== tidy ? tidy[1] : ""), -1, true);
                        }
                    }
                }
                return that.record(), false;
            }
            if ('h' === key) {
                return toggleBlocks(that), that.record(), false;
            }
            if ('i' === key) {
                return toggle.apply(that, elements.i), false;
            }
            if ('k' === key) {
                return toggleCodes(that), that.record(), false;
            }
            if ('l' === key) {
                if (isFunction(prompt)) {
                    let href = prompt('URL:', value && /^https?:\/\/\S+$/.test(value) ? value : 'http://');
                    elements.a[2].href = href;
                    if (value) {
                        that.record(); // Record selection
                    }
                    if (href) {
                        toggle.apply(that, elements.a);
                    }
                }
                return that.record(), false;
            }
            if ('u' === key) {
                return toggle.apply(that, elements.u), false;
            }
            if ('Enter' === key) {
                let m = lineAfter.match(toPattern(tagEnd(tagName) + '\\s*$', "")),
                    name = m && m[1] || elements.p[0];
                if (s) {
                    that.select(start - toCount(lineBefore));
                    toggle.apply(that, elements[name] || elements.p);
                    that.replace(toPattern('^(' + tagEnd(tagName) + ')\\s*(.)', ""), '$1\n' + lineMatchIndent + '$3', 1);
                    that.replace(toPattern('(^|\\n)\\s*(' + tagStart(tagName) + ')$', ""), '$1' + lineMatchIndent + '$2', -1);
                    return that.record(), false;
                }
                that.select(end + toCount(lineAfter));
                toggle.apply(that, elements[name] || elements.p);
                that.replace(toPattern('(.)\\s*(' + tagStart(tagName) + ')$', ""), '$1\n' + lineMatchIndent + '$2', -1);
                return that.record(), false;
            }
        } // Do nothing
        if (a || c) {
            return true;
        }
        if ('Enter' === key) {
            let {
                after,
                before,
                value
            } = that.$(),
                lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop(),
                lineMatch = lineBefore.match(/^(\s+)/),
                lineMatchIndent = lineMatch && lineMatch[1] || "",
                m,
                n;
            if (!value) {
                if (after && before) {
                    let continueOnEnterTags = ['li', 'option', 'p', 'td', 'th'];
                    for (let i = 0, j = toCount(continueOnEnterTags); i < j; ++i) {
                        n = continueOnEnterTags[i];
                        if (toPattern('^' + tagEnd(n), "").test(lineAfter) && (m = lineBefore.match(toPattern('^\\s*' + tagStart(n), "")))) {
                            // `<asdf>|</asdf>`
                            if (m[0] === lineBefore) {
                                // Unwrap if empty!
                                that.replace(toPattern(tagStart(n) + '$', ""), "", -1);
                                that.replace(toPattern('^' + tagEnd(n), ""), "", 1);
                                return that.record(), false;
                            } // `<asdf>asdf|</asdf>`
                            return that.insert('</' + n + '>\n' + lineMatchIndent + '<' + n + (m[2] || "") + '>', -1).insert(elements[n] ? elements[n][1] || "" : "").record(), false;
                        }
                    }
                    let noIndentOnEnterTags = ['script', 'style'];
                    for (let i = 0, j = toCount(noIndentOnEnterTags); i < j; ++i) {
                        n = noIndentOnEnterTags[i];
                        if (toPattern('^' + tagEnd(n), "").test(lineAfter) && toPattern(tagStart(n) + '$', "").test(lineBefore)) {
                            return that.wrap('\n' + lineMatchIndent, '\n' + lineMatchIndent).insert(elements[n] ? elements[n][1] || "" : "").record(), false;
                        }
                    }
                    for (let i = 1; i < 7; ++i) {
                        if ('</' + elements['h' + i][0] + '>' === lineAfter && lineBefore.match(toPattern('^\\s*' + tagStart(elements['h' + i][0]), ""))) {
                            return that.insert('</' + elements['h' + i][0] + '>\n' + lineMatchIndent + '<' + elements.p[0] + '>', -1).replace(toPattern('^' + tagEnd(elements['h' + i][0])), '</' + elements.p[0] + '>', 1).insert(elements.p[1]).record(), false;
                        }
                    }
                }
            }
        }
        return true;
    }
    const state = defaults;
    exports.canKeyDown = canKeyDown;
    exports.state = state;
});