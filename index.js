/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2023 Taufik Nurrohman <https://github.com/taufik-nurrohman>
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
    var hasValue = function hasValue(x, data) {
        return -1 !== data.indexOf(x);
    };
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
    var W = window;
    var theLocation = W.location;
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
    var toCount = function toCount(x) {
        return x.length;
    };
    var toHTML = function toHTML(x, quote) {
        if (quote === void 0) {
            quote = true;
        }
        x = x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        if (quote) {
            x = x.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
        }
        return x;
    };
    var toObjectKeys = function toObjectKeys(x) {
        return Object.keys(x);
    };
    var fromHTML = function fromHTML(x, quote) {
        x = x.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
        if (quote) {
            x = x.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
        }
        return x;
    };
    var fromStates = function fromStates() {
        for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
            lot[_key] = arguments[_key];
        }
        var out = lot.shift();
        for (var i = 0, j = toCount(lot); i < j; ++i) {
            for (var k in lot[i]) {
                // Assign value
                if (!isSet(out[k])) {
                    out[k] = lot[i][k];
                    continue;
                } // Merge array
                if (isArray(out[k]) && isArray(lot[i][k])) {
                    out[k] = [
                        /* Clone! */
                    ].concat(out[k]);
                    for (var ii = 0, jj = toCount(lot[i][k]); ii < jj; ++ii) {
                        if (!hasValue(lot[i][k][ii], out[k])) {
                            out[k].push(lot[i][k][ii]);
                        }
                    } // Merge object recursive
                } else if (isObject(out[k]) && isObject(lot[i][k])) {
                    out[k] = fromStates({
                        /* Clone! */
                    }, out[k], lot[i][k]); // Replace value
                } else {
                    out[k] = lot[i][k];
                }
            }
        }
        return out;
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
    var tagStart$1 = function tagStart(name) {
            return '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>';
        },
        tagEnd$1 = function tagEnd(name) {
            return '</(' + name + ')>';
        };
    var that = {};

    function toAttributes(attributes) {
        if (!attributes) {
            return "";
        } // Sort object by key(s)
        attributes = toObjectKeys(attributes).sort().reduce(function(r, k) {
            return r[k] = attributes[k], r;
        }, {});
        var attribute,
            v,
            out = "";
        for (attribute in attributes) {
            v = attributes[attribute];
            if (false === v || null === v) {
                continue;
            }
            out += ' ' + attribute;
            if (true !== v) {
                out += '="' + fromHTML(fromValue(v), true) + '"';
            }
        }
        return out;
    }

    function toTidy$1(tidy) {
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
    that.insert = function(name, content, attributes, tidy) {
        if (content === void 0) {
            content = "";
        }
        if (attributes === void 0) {
            attributes = {};
        }
        if (tidy === void 0) {
            tidy = false;
        }
        var t = this;
        if (false !== (tidy = toTidy$1(tidy))) {
            t.trim(tidy[0], "");
        }
        return t.insert('<' + name + toAttributes(attributes) + (false !== content ? '>' + content + '</' + name + '>' : ' />') + (false !== tidy ? tidy[1] : ""), -1, true);
    };
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
        if (false !== (tidy = toTidy$1(tidy))) {
            t.trim(tidy[0], tidy[1]);
        }
        return t.wrap('<' + name + toAttributes(attributes) + '>', '</' + name + '>');
    };
    that.wrap = function(name, content, attributes, tidy) {
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
            _t$$2 = t.$();
        _t$$2.after;
        _t$$2.before;
        var value = _t$$2.value;
        if (!value && content) {
            t.insert(content);
        }
        if (false !== (tidy = toTidy$1(tidy))) {
            t.trim(tidy[0], tidy[1]);
        }
        return t.wrap('<' + name + toAttributes(attributes) + '>', '</' + name + '>');
    };
    const protocol = theLocation.protocol;
    const defaults = {
        defaults: {
            "": ["", 'text goes here…', {}, ""],
            a: ['a', 'link text goes here…', {}],
            area: ['area', false, {}],
            b: ['strong', 'text goes here…', {}],
            base: ['base', false, {
                href: ""
            }, '\n'],
            blockquote: ['blockquote', 'quote goes here…', {}, '\n'],
            br: ['br', false, {},
                ["", '\n']
            ],
            button: ['button', 'text goes here…', {
                name: "",
                type: 'submit'
            }, ' '],
            caption: ['caption', 'table caption goes here…', {}, '\n'],
            code: ['code', 'code goes here…', {}, ' '],
            col: ['col', false, {}, '\n'],
            em: ['em', 'text goes here…', {}],
            figcaption: ['figcaption', 'image caption goes here…', {}, '\n'],
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
            q: ['q', 'quote goes here…', {}, ' '],
            script: ['script', 'code goes here…', {}, '\n'],
            select: ['select', "", {
                name: ""
            }, ' '],
            source: ['source', false, {
                src: ""
            }, '\n'],
            strong: ['strong', 'text goes here…', {}],
            style: ['style', 'code goes here…', {}, '\n'],
            td: ['td', 'data goes here…', {}, '\n'],
            textarea: ['textarea', 'value goes here…', {
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
        },
        source: {
            type: 'HTML'
        }
    };
    const {
        toggle
    } = that;
    let tagName = '[\\w:.-]+',
        tagStart = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>',
        tagEnd = name => '</(' + name + ')>';

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

    function toggleBlocks(that) {
        let patternBefore = /<(?:h([1-6])|p)(\s[^>]*)?>$/,
            patternAfter = /^<\/(?:h[1-6]|p)>/;
        let {
            after,
            end,
            before,
            start,
            value
        } = that.$(),
            state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = state.defaults || {}; // Wrap current line if selection is empty
        if (!value) {
            let lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop();
            if (!lineAfter.trim() && !lineBefore.trim()) {
                that.insert(defaults.h1[1]);
            } else {
                that.select(start - toCount(lineBefore), end + toCount(lineAfter));
            }
        }
        let lineMatch = before.split('\n').pop().match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "";
        that.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
            let t = this,
                h = +(before[1] || 0),
                attr = before[2] || "",
                element = before[0] ? defaults[before[0].slice(1, -1).split(/\s/)[0]] : ["", "", {}];
            if (!attr && element[2]) {
                attr = toAttributes(element[2]);
            } // ``
            t.replace(patternBefore, "", -1);
            t.replace(/\n+/g, ' ');
            t.replace(patternAfter, "", 1);
            let tidy = element[3] || defaults.h1[3];
            if (false !== (tidy = toTidy(tidy))) {
                t.trim(tidy[0], tidy[1]);
            }
            if (!h) {
                // `<h1>`
                t.wrap(lineMatchIndent + '<' + defaults.h1[0] + (attr || toAttributes(defaults.h1[2])) + '>', '</' + defaults.h1[0] + '>');
                if (!value[0] || value[0] === defaults.h1[1] || value[0] === defaults.h2[1] || value[0] === defaults.h3[1] || value[0] === defaults.h4[1] || value[0] === defaults.h5[1] || value[0] === defaults.h6[1] || value[0] === defaults.p[1]) {
                    t.insert(defaults.h1[1]);
                }
            } else {
                ++h;
                if (h > 6) {
                    // `<p>`
                    t.wrap(lineMatchIndent + '<' + defaults.p[0] + (attr || toAttributes(defaults.p[2])) + '>', '</' + defaults.p[0] + '>');
                    if (!value[0] || value[0] === defaults.h1[1] || value[0] === defaults.h2[1] || value[0] === defaults.h3[1] || value[0] === defaults.h4[1] || value[0] === defaults.h5[1] || value[0] === defaults.h6[1] || value[0] === defaults.p[1]) {
                        t.insert(defaults.p[1]);
                    }
                } else {
                    // `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
                    t.wrap(lineMatchIndent + '<' + defaults['h' + h][0] + (attr || toAttributes(defaults['h' + h][2])) + '>', '</' + defaults['h' + h][0] + '>');
                    if (!value[0] || value[0] === defaults.h1[1] || value[0] === defaults.h2[1] || value[0] === defaults.h3[1] || value[0] === defaults.h4[1] || value[0] === defaults.h5[1] || value[0] === defaults.h6[1] || value[0] === defaults.p[1]) {
                        t.insert(defaults['h' + h][1]);
                    }
                }
            }
            t.replace(toPattern('^(' + tagEnd('h[1-6]|p') + ')\\s*(' + tagEnd(tagName) + ')'), '$1\n' + lineMatchIndent.replace(toPattern('^' + charIndent), "") + '$3', 1);
        }); // Unwrap selection from block element(s)
        that.replace(toPattern('^\\s*' + tagStart('blockquote|h[1-6]|p(re)?')), "");
        that.replace(toPattern(tagEnd('blockquote|h[1-6]|p(re)?') + '\\s*$'), "");
    }

    function toggleCodes(that) {
        let patternBefore = /<(?:pre|code)(?:\s[^>]*)?>(?:\s*<code(?:\s[^>]*)?>)?$/,
            patternAfter = /^(?:<\/code>\s*)?<\/(?:pre|code)>/;
        that.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
            let t = this,
                tidy,
                defaults = that.state.defaults || {}; // ``
            t.replace(patternBefore, "", -1);
            t.replace(patternAfter, "", 1);
            if (after[0]) {
                // ``
                if (/^(?:<\/code>\s*)?<\/pre>/.test(after[0])) {
                    tidy = defaults[""][3];
                    if (false !== (tidy = toTidy(tidy))) {
                        t.trim(tidy[0], tidy[1]);
                    }
                    t.insert(toHTML(value[0])); // `<pre><code>…</code></pre>`
                } else if (after[0].slice(0, 7) === '</' + defaults.code[0] + '>') {
                    tidy = defaults.pre[3];
                    if (false !== (tidy = toTidy(tidy))) {
                        t.trim(tidy[0], tidy[1]);
                    }
                    t.wrap('<' + defaults.pre[0] + toAttributes(defaults.pre[2]) + '><' + defaults.code[0] + toAttributes(defaults.code[2]) + '>', '</' + defaults.code[0] + '></' + defaults.pre[0] + '>');
                } // `<code>…</code>`
            } else {
                tidy = defaults.code[3];
                if (false !== (tidy = toTidy(tidy))) {
                    t.trim(tidy[0], tidy[1]);
                }
                t.wrap('<' + defaults.code[0] + toAttributes(defaults.code[2]) + '>', '</' + defaults.code[0] + '>').insert(fromHTML(value[0] || defaults.code[1]));
            }
        });
    }

    function toggleQuotes(that) {
        let patternBefore = /<(blockquote|q)(?:\s[^>]*)?>\s*$/,
            patternAfter = /^\s*<\/(blockquote|q)>/;
        let {
            after,
            end,
            before,
            start,
            value
        } = that.$(),
            state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = that.state.defaults || {};
        if (!value && (!after || '\n' === after[0]) && (!before || '\n' === before.slice(-1))) {
            that.wrap('<' + defaults.blockquote[0] + toAttributes(defaults.blockquote[2]) + '>', '</' + defaults.blockquote[0] + '>').insert(defaults.blockquote[1]);
        } else {
            that.match([patternBefore, /[\s\S]*/, patternAfter], function(before, value, after) {
                let t = this,
                    tidy; // ``
                t.replace(patternBefore, "", -1);
                t.replace(patternAfter, "", 1);
                if (value[0] && (/\n/.test(value[0]) || (!after || '\n' === after[0]) && (!before || '\n' === before.slice(-1)))) {
                    if (false !== (tidy = toTidy(defaults.blockquote[3]))) {
                        t.trim(tidy[0], tidy[1]);
                    }
                    if (defaults.blockquote[0] === after[1]) {
                        t.replace(toPattern('(^|\\n)' + charIndent), '$1');
                    } else {
                        t.wrap('<' + defaults.blockquote[0] + toAttributes(defaults.blockquote[2]) + '>\n', '\n</' + defaults.blockquote[0] + '>');
                        t.replace(toPattern('(^|\\n)'), '$1' + charIndent);
                    }
                } else if (after[0]) {
                    // ``
                    if (defaults.blockquote[0] === after[1]) {
                        if (false !== (tidy = toTidy(defaults[""][3]))) {
                            t.trim(tidy[0], tidy[1]);
                        }
                        t.replace(toPattern('(^|\\n)' + charIndent), '$1'); // `<blockquote>…</blockquote>`
                    } else if (defaults.q[0] === after[1]) {
                        if (false !== (tidy = toTidy(defaults.blockquote[3]))) {
                            t.trim(tidy[0], tidy[1]);
                        }
                        t.wrap('<' + defaults.blockquote[0] + toAttributes(defaults.blockquote[2]) + '>\n', '\n</' + defaults.blockquote[0] + '>').insert(value[0] || defaults.blockquote[1]);
                        if (value[0] !== defaults.blockquote[1] && value[0] !== defaults.q[1]) {
                            t.replace(toPattern('(^|\\n)'), '$1' + charIndent);
                        }
                    } // `<q>…</q>`
                } else {
                    if (false !== (tidy = toTidy(defaults.q[3]))) {
                        t.trim(tidy[0], tidy[1]);
                    }
                    t.wrap('<' + defaults.q[0] + toAttributes(defaults.q[2]) + '>', '</' + defaults.q[0] + '>').insert(value[0] || defaults.q[1]);
                    t.replace(toPattern('(^|\\n)' + charIndent), '$1');
                }
            });
        }
    }
    const commands = {};
    commands.blocks = function() {
        let that = this;
        return that.record(), toggleBlocks(that), that.record(), false;
    };
    commands.bold = function() {
        let that = this,
            state = that.state,
            defaults = state.defaults || {};
        return that.record(), toggle.apply(that, defaults.b), false;
    };
    commands.code = function() {
        let that = this;
        return that.record(), toggleCodes(that), that.record(), false;
    };
    commands.image = function(label = 'URL:', placeholder) {
        let that = this,
            {
                after,
                before,
                value
            } = that.$(),
            state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = state.defaults || {},
            lineBefore = before.split('\n').pop(),
            lineMatch = lineBefore.match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "",
            prompt = state.source.prompt;
        if (isFunction(prompt)) {
            prompt(label, value && /^https?:\/\/\S+$/.test(value) ? value : placeholder || protocol + '//').then(src => {
                if (!src) {
                    that.focus();
                    return;
                }
                let element = defaults.img;
                if (value) {
                    element[2].alt = value;
                    that.record(); // Record selection
                }
                let tidy = element[3] || false;
                if (false !== (tidy = toTidy(tidy))) {
                    that.trim(tidy[0], "");
                }
                element[2].src = src;
                if ((!after || '\n' === after[0]) && (!before || '\n' === before.slice(-1))) {
                    tidy = defaults.figure[3] || false;
                    if (false !== (tidy = toTidy(tidy))) {
                        that.trim(tidy[0], tidy[1]);
                    }
                    that.insert("");
                    that.wrap(lineMatchIndent + '<' + defaults.figure[0] + toAttributes(defaults.figure[2]) + '>\n' + lineMatchIndent + charIndent, lineMatchIndent + '\n</' + defaults.figure[0] + '>');
                    that.insert('<' + element[0] + toAttributes(element[2]) + '>\n' + lineMatchIndent + charIndent, -1);
                    that.wrap('<' + defaults.figcaption[0] + toAttributes(defaults.figcaption[2]) + '>', '</' + defaults.figcaption[0] + '>').insert(defaults.figcaption[1]);
                } else {
                    that.insert('<' + element[0] + toAttributes(element[2]) + '>' + (false !== tidy ? tidy[1] : ""), -1, true);
                }
            }).catch(e => 0);
        }
        return that.record(), false;
    };
    commands.italic = function() {
        let that = this,
            state = that.state,
            defaults = state.defaults || {};
        return that.record(), toggle.apply(that, defaults.i), false;
    };
    commands.link = function(label = 'URL:', placeholder) {
        let that = this,
            {
                before,
                value
            } = that.$(),
            state = that.state,
            defaults = state.defaults || {},
            prompt = state.source.prompt;
        if (isFunction(prompt)) {
            let element = defaults.a,
                href,
                m,
                wrapped;
            if (m = toPattern(tagStart(element[0])).exec(before)) {
                wrapped = true;
                m = /\shref=(?:"([^"]+)"|'([^']+)'|([^>\/\s]+))/.exec(m[2]);
                href = toHTML((m[1] || "") + (m[2] || "") + (m[3] || ""));
            } else if (m = toPattern('^\\s*' + tagStart(element[0])).exec(value)) {
                m = /\shref=(?:"([^"]+)"|'([^']+)'|([^>\/\s]+))/.exec(m[2]);
                href = toHTML((m[1] || "") + (m[2] || "") + (m[3] || ""));
            }
            prompt(label, value && /^https?:\/\/\S+$/.test(value) ? value : href || placeholder || protocol + '//').then(href => {
                if (!href) {
                    that.focus();
                    return;
                }
                if (value) {
                    that.record(); // Record selection
                }
                element[2].href = href;
                let local = /[.\/?&#]/.test(href[0]) || /^(data|javascript|mailto):/.test(href) || -1 === href.indexOf('://'),
                    extras = {};
                if (!local) {
                    extras.rel = 'nofollow';
                    extras.target = '_blank';
                }
                let tidy = toTidy(element[3] || false);
                if (false === tidy && !value) {
                    // Tidy link with a space if there is no selection
                    tidy = [' ', ' '];
                }
                if (wrapped) {
                    toggle.apply(that, [element[0]]); // Unwrap if already wrapped, then…
                }
                toggle.apply(that, [element[0], element[1], fromStates(extras, element[2]), tidy]); // Wrap!
            }).catch(e => 0);
        }
        return that.record(), false;
    };
    commands.quote = function() {
        let that = this;
        return that.record(), toggleQuotes(that), that.record(), false;
    };
    commands.underline = function() {
        let that = this,
            state = that.state,
            defaults = state.defaults || {};
        return that.record(), toggle.apply(that, defaults.u), false;
    };

    function canKeyDown(map, that) {
        let state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = state.defaults || {},
            {
                key,
                queue
            } = map;
        if (queue.Control) {
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
            if ('Enter' === key) {
                let m = lineAfter.match(toPattern(tagEnd(tagName) + '\\s*$', "")),
                    element = defaults[m && m[1] || 'p'] || defaults.p;
                element[3] = ['\n' + lineMatchIndent, '\n' + (!queue.Shift && after && toPattern('^\\s*' + tagEnd(tagName)).test(after.split('\n')[1] || "") ? lineMatchIndent.replace(toPattern('^' + charIndent), "") : lineMatchIndent)];
                that.select(queue.Shift ? start - toCount(lineBefore) : end + toCount(lineAfter));
                toggle.apply(that, element);
                return that.record(), false;
            }
        } // Do nothing
        if (queue.Alt || queue.Control) {
            return true;
        }
        if ('>' === key) {
            let {
                after,
                before,
                end
            } = that.$(),
                lineBefore = before.split('\n').pop(),
                m = (lineBefore + '>').match(toPattern(tagStart(tagName) + '$', "")),
                n,
                element = defaults[n = m && m[1] || ""];
            if (!n) {
                return true;
            }
            if (element) {
                if (false !== element[1]) {
                    if ('>' === after[0]) {
                        that.select(end + 1);
                    } else {
                        that.insert('>', -1);
                    }
                    that.insert('</' + n + '>', 1).insert(element[1]);
                } else {
                    if ('>' === after[0]) {
                        that.insert(' /', -1).select(end + 3);
                    } else {
                        that.insert(' />', -1);
                    }
                }
            } else {
                if ('>' === after[0]) {
                    that.select(end + 1);
                } else {
                    that.insert('>', -1);
                }
                that.insert('</' + n + '>', 1);
            }
            return that.record(), false;
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
            let continueOnEnterTags = ['li', 'option', 'p', 'td', 'th'],
                noIndentOnEnterTags = ['pre', 'script', 'style'];
            if (m = lineBefore.match(toPattern(tagStart(tagName) + '$', ""))) {
                let element = defaults[m[1]];
                if (element && false === element[1]) {
                    return that.insert('\n' + lineMatchIndent, -1).record(), false;
                }
            } // `<br>`
            if (queue.Shift) {
                let {
                    br
                } = defaults;
                return that.insert('<' + br[0] + toAttributes(br[2]) + '>' + (false === br[1] ? "" : br[1] + '</' + br[0] + '>') + '\n', -1).record(), false;
            }
            if (after && before) {
                for (let i = 0, j = toCount(continueOnEnterTags); i < j; ++i) {
                    n = continueOnEnterTags[i];
                    if (toPattern('^' + tagEnd(n), "").test(lineAfter) && (m = lineBefore.match(toPattern('^\\s*' + tagStart(n), "")))) {
                        // `<foo>|</foo>`
                        if (m[0] === lineBefore) {
                            if (defaults[n] && value && defaults[n][1] === value) {
                                that.insert("").wrap('\n' + lineMatchIndent + charIndent, '\n' + lineMatchIndent); // Unwrap if empty!
                            } else {
                                toggle.apply(that, [n]);
                            }
                            return that.record(), false;
                        } // `<foo>bar|</foo>`
                        return that.insert('</' + n + '>\n' + lineMatchIndent + '<' + n + (m[2] || "") + '>', -1).insert(defaults[n] ? defaults[n][1] || "" : "").record(), false;
                    }
                }
                for (let i = 0, j = toCount(noIndentOnEnterTags); i < j; ++i) {
                    n = noIndentOnEnterTags[i];
                    if (toPattern('^' + tagEnd(n), "").test(lineAfter) && toPattern(tagStart(n) + '$', "").test(lineBefore)) {
                        return that.wrap('\n' + lineMatchIndent, '\n' + lineMatchIndent).insert(defaults[n] ? defaults[n][1] || "" : "").record(), false;
                    }
                }
                for (let i = 1; i < 7; ++i) {
                    if (lineAfter.startsWith('</' + defaults['h' + i][0] + '>') && lineBefore.match(toPattern('^\\s*' + tagStart(defaults['h' + i][0]), ""))) {
                        if (defaults['h' + i] && value && defaults['h' + i][1] === value) {
                            that.insert("").wrap('\n' + lineMatchIndent + charIndent, '\n' + lineMatchIndent); // Insert paragraph below!
                        } else {
                            that.insert('</' + defaults['h' + i][0] + '>\n' + lineMatchIndent + '<' + defaults.p[0] + '>', -1).replace(toPattern('^' + tagEnd(defaults['h' + i][0])), '</' + defaults.p[0] + '>', 1).insert(defaults.p[1]);
                        }
                        return that.record(), false;
                    }
                }
            }
        }
        return true;
    }
    const state = defaults;
    exports.canKeyDown = canKeyDown;
    exports.commands = commands;
    exports.state = state;
});