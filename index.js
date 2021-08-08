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
    var W = window;
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

    function toAttributes(attributes) {
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
        return t.wrap('<' + name + toAttributes(attributes) + '>', '</' + name + '>');
    };
    const defaults = {
        sourceHTML: {
            input: (key, value) => W.prompt(key, value),
            object: {
                a: ['a', 'link text goes here…', {}, ""],
                area: ['area', false, {}, ""],
                b: ['strong', 'text goes here…', {}, ""],
                base: ['base', false, {}, '\n'],
                blockquote: ['blockquote', "", {}, '\n'],
                br: ['br', false, {},
                    ["", '\n']
                ],
                code: ['code', 'code goes here…', {}, ""],
                col: ['col', false, {}, '\n'],
                em: ['em', 'text goes here…', {}, ""],
                h1: ['h1', 'title goes here…', {}, '\n'],
                h2: ['h2', 'title goes here…', {}, '\n'],
                h3: ['h3', 'title goes here…', {}, '\n'],
                h4: ['h4', 'title goes here…', {}, '\n'],
                h5: ['h5', 'title goes here…', {}, '\n'],
                h6: ['h6', 'title goes here…', {}, '\n'],
                hr: ['hr', false, {}, '\n'],
                i: ['em', 'text goes here…', {}, ""],
                img: ['img', false, {
                    alt: ""
                }, ' '],
                input: ['input', false, {}, ' '],
                li: ['li', "", {}, '\n'],
                link: ['link', false, {}, '\n'],
                meta: ['meta', false, {}, '\n'],
                ol: ['ol', "", {}, '\n'],
                option: ['option', 'option goes here…', {}, '\n'],
                p: ['p', 'paragraph goes here…', {}, '\n'],
                param: ['param', false, {}, '\n'],
                pre: ['pre', 'text goes here…', {}, '\n'],
                source: ['source', false, {}, '\n'],
                strong: ['strong', 'text goes here…', {}, ""],
                td: ['td', "", {}, '\n'],
                th: ['th', "", {}, '\n'],
                tr: ['tr', "", {}, '\n'],
                track: ['track', false, {}, '\n'],
                u: ['u', 'text goes here…', {}, ""],
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

    function toggleBlocks(editor) {
        let patternBefore = /<(?:h([1-6])|p)(\s[^>]*)?>$/,
            patternAfter = /^<\/(?:h[1-6]|p)>/;
        editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
            let t = this,
                h = +(before[1] || 0),
                attr = before[2] || ""; // ``
            t.replace(patternBefore, "", -1);
            t.replace(patternAfter, "", 1);
            t.trim('\n', '\n');
            if (!h) {
                // `<h1>`
                t.wrap('<h1' + attr + '>', '</h1>');
            } else {
                ++h;
                if (h > 6) {
                    // `<p>`
                    t.wrap('<p' + attr + '>', '</p>');
                } else {
                    // `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
                    t.wrap('<h' + h + attr + '>', '</h' + h + '>');
                }
            }
        });
    }

    function toggleCodes(editor) {
        let patternBefore = /<(?:pre|code)(?:\s[^>]*)?>(?:\s*<code(?:\s[^>]*)?>)?$/,
            patternAfter = /^(?:<\/code>\s*)?<\/(?:pre|code)>/;
        editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
            let t = this; // ``
            t.replace(patternBefore, "", -1);
            t.replace(patternAfter, "", 1);
            if (after[0]) {
                // ``
                if (/^(?:<\/code>\s*)?<\/pre>/.test(after[0])) {
                    t.trim(' ', ' ').insert(decode(editor.$().value)); // `<pre><code> … </code></pre>`
                } else if (after[0].slice(0, 7) === '</code>') {
                    t.trim('\n', '\n').wrap('<pre><code>', '</code></pre>');
                } // `<code> … </code>`
            } else {
                t.trim(' ', ' ').wrap('<code>', '</code>').insert(encode(editor.$().value));
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
            object = state.sourceHTML?.object || {};
        state.sourceHTML?.tab || state.tab || '\t';
        let input = state.sourceHTML?.input;
        if (c) {
            if ('b' === key) {
                return toggle.apply(that, object.b), false;
            }
            if ('g' === key) {
                if (isFunction(input)) {
                    let value = that.$().value,
                        src = input('URL:', value && /^https?:\/\/\S+$/.test(value) ? value : 'http://');
                    object.img[2].src = src;
                    if (value) {
                        object.img[2].alt = value;
                        that.record(); // Record selection
                    }
                    if (src) {
                        let tidy = object.img[3] || false;
                        if (false !== tidy) {
                            if (true === tidy) {
                                tidy = ["", ""];
                            }
                            if (isString(tidy)) {
                                tidy = [tidy, tidy];
                            }
                        }
                        that.trim(tidy[0], ""); // TODO: Generate attribute(s)
                        that.insert('<' + object.img[0] + ' alt="' + value + '" src="' + src + '">' + (tidy[1] || tidy[0]), -1, true);
                    }
                }
                return that.record(), false;
            }
            if ('h' === key) {
                return toggleBlocks(that), that.record(), false;
            }
            if ('i' === key) {
                return toggle.apply(that, object.i), false;
            }
            if ('k' === key) {
                return toggleCodes(that), that.record(), false;
            }
            if ('l' === key) {
                if (isFunction(input)) {
                    let value = that.$().value,
                        href = input('URL:', value && /^https?:\/\/\S+$/.test(value) ? value : 'http://');
                    object.a[2].href = href;
                    if (value) {
                        that.record(); // Record selection
                    }
                    if (href) {
                        toggle.apply(that, object.a);
                    }
                }
                return that.record(), false;
            }
            if ('u' === key) {
                return toggle.apply(that, object.u), false;
            }
            if ('Enter' === key) {
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
                    lineMatchIndent = lineMatch && lineMatch[1] || "",
                    m;
                if ("" === value) {
                    m = lineAfter.match(toPattern(tagEnd(tagName) + '\\s*$', ""));
                    let n = m && m[1] || object.p[0];
                    if (s) {
                        that.select(start - toCount(lineBefore));
                        toggle.apply(that, object[n] || object.p);
                        that.replace(toPattern('^(' + tagEnd(tagName) + ')\\s*(.)', ""), '$1\n' + lineMatchIndent + '$3', 1);
                        that.replace(toPattern('(^|\\n)\\s*(' + tagStart(tagName) + ')$', ""), '$1' + lineMatchIndent + '$2', -1);
                        return that.record(), false;
                    }
                    that.select(end + toCount(lineAfter));
                    toggle.apply(that, object[n] || object.p);
                    that.replace(toPattern('(.)\\s*(' + tagStart(tagName) + ')$', ""), '$1\n' + lineMatchIndent + '$2', -1);
                    return that.record(), false;
                }
                return true;
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
                m;
            if (!value) {
                if (after && before) {
                    let continueable = ['li', 'option', 'p', 'td', 'th'],
                        n;
                    for (let i = 0, j = toCount(continueable); i < j; ++i) {
                        if (!(n = object[continueable[i]])) {
                            continue;
                        }
                        n = n[0];
                        if ('</' + n + '>' === lineAfter && (m = lineBefore.match(toPattern('^\\s*' + tagStart(n), "")))) {
                            // `<asdf>|</asdf>`
                            if (m[0] === lineBefore) {
                                that.replace(toPattern(tagStart(n) + '$', ""), "", -1);
                                that.replace(toPattern('^' + tagEnd(n), ""), "", 1);
                                return that.record(), false;
                            } // `<asdf>asdf|</asdf>`
                            return that.insert('</' + n + '>\n' + lineMatchIndent + '<' + n + (m[2] || "") + '>', -1).record(), false;
                        }
                    }
                    for (let i = 1; i < 7; ++i) {
                        if ('</' + object['h' + i][0] + '>' === lineAfter && lineBefore.match(toPattern('^\\s*' + tagStart(object['h' + i][0]), ""))) {
                            return that.insert('</' + object['h' + i][0] + '>\n' + lineMatchIndent + '<' + object.p[0] + '>', -1).replace(toPattern('^' + tagEnd(object['h' + i][0])), '</' + object.p[0] + '>', 1).record(), false;
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