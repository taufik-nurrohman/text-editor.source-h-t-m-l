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
(function (g, f) {
    typeof exports === 'object' && typeof module !== 'undefined' ? f(exports) : typeof define === 'function' && define.amd ? define(['exports'], f) : (g = typeof globalThis !== 'undefined' ? globalThis : g || self, f((g.TE = g.TE || {}, g.TE.SourceHTML = {})));
})(this, (function (exports) {
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
    var isInstance = function isInstance(x, of) {
        return x && isSet(of) && x instanceof of ;
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
                }
                // Merge array
                if (isArray(out[k]) && isArray(lot[i][k])) {
                    out[k] = [ /* Clone! */ ].concat(out[k]);
                    for (var ii = 0, jj = toCount(lot[i][k]); ii < jj; ++ii) {
                        if (!hasValue(lot[i][k][ii], out[k])) {
                            out[k].push(lot[i][k][ii]);
                        }
                    }
                    // Merge object recursive
                } else if (isObject(out[k]) && isObject(lot[i][k])) {
                    out[k] = fromStates({
                        /* Clone! */ }, out[k], lot[i][k]);
                    // Replace value
                } else {
                    out[k] = lot[i][k];
                }
            }
        }
        return out;
    };
    var fromValue = function fromValue(x) {
        if (isArray(x)) {
            return x.map(function (v) {
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
    var W = window;
    var theLocation = W.location;
    var isPattern = function isPattern(pattern) {
        return isInstance(pattern, RegExp);
    };
    var toPattern = function toPattern(pattern, opt) {
        if (isPattern(pattern)) {
            return pattern;
        }
        // No need to escape `/` in the pattern string
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
        if (!attributes) {
            return "";
        }
        // Sort object by key(s)
        attributes = toObjectKeys(attributes).sort().reduce(function (r, k) {
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
    that.insert = function (name, content, attributes, tidy) {
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
        if (false !== (tidy = toTidy(tidy))) {
            t.trim(tidy[0], "");
        }
        return t.insert('<' + name + toAttributes(attributes) + (false !== content ? '>' + content + '</' + name + '>' : ' />') + (false !== tidy ? tidy[1] : ""), -1, true);
    };
    that.toggle = function (name, content, attributes, tidy) {
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
        if (false !== (tidy = toTidy(tidy))) {
            t.trim(tidy[0], tidy[1]);
        }
        return t.wrap('<' + name + toAttributes(attributes) + '>', '</' + name + '>');
    };
    that.wrap = function (name, content, attributes, tidy) {
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
        if (false !== (tidy = toTidy(tidy))) {
            t.trim(tidy[0], tidy[1]);
        }
        return t.wrap('<' + name + toAttributes(attributes) + '>', '</' + name + '>');
    };
    var protocol = theLocation.protocol;
    var defaults = {
        defaults: {
            "": ["", 'text goes here…', {}],
            a: ['a', 'link text goes here…', {}],
            area: ['area', false, {}],
            b: ['strong', 'text goes here…', {}],
            base: ['base', false, {
                href: ""
            }],
            blockquote: ['blockquote', 'quote goes here…', {}],
            br: ['br', false, {}],
            button: ['button', 'text goes here…', {
                name: "",
                type: 'submit'
            }],
            caption: ['caption', 'table caption goes here…', {}],
            code: ['code', 'code goes here…', {}],
            col: ['col', false, {}],
            dd: ['dd', 'data goes here…', {}],
            dl: ['dl', "", {}],
            dt: ['dt', 'title goes here…', {}],
            em: ['em', 'text goes here…', {}],
            figcaption: ['figcaption', 'image caption goes here…', {}],
            figure: ['figure', "", {}],
            h1: ['h1', 'title goes here…', {}],
            h2: ['h2', 'title goes here…', {}],
            h3: ['h3', 'title goes here…', {}],
            h4: ['h4', 'title goes here…', {}],
            h5: ['h5', 'title goes here…', {}],
            h6: ['h6', 'title goes here…', {}],
            hr: ['hr', false, {}],
            i: ['em', 'text goes here…', {}],
            img: ['img', false, {
                alt: "",
                src: ""
            }],
            input: ['input', false, {
                name: "",
                type: 'text'
            }],
            li: ['li', 'list item goes here…', {}],
            link: ['link', false, {
                href: ""
            }],
            meta: ['meta', false, {}],
            ol: ['ol', "", {}],
            option: ['option', 'option goes here…', {}],
            p: ['p', 'paragraph goes here…', {}],
            param: ['param', false, {
                name: ""
            }],
            pre: ['pre', 'text goes here…', {}],
            q: ['q', 'quote goes here…', {}],
            script: ['script', 'code goes here…', {}],
            select: ['select', "", {
                name: ""
            }],
            source: ['source', false, {
                src: ""
            }],
            strong: ['strong', 'text goes here…', {}],
            style: ['style', 'code goes here…', {}],
            tbody: ['tbody', "", {}],
            td: ['td', 'data goes here…', {}],
            textarea: ['textarea', 'value goes here…', {
                name: ""
            }],
            tfoot: ['tfoot', "", {}],
            th: ['th', 'title goes here…', {}],
            thead: ['thead', "", {}],
            tr: ['tr', "", {}],
            track: ['track', false, {}],
            u: ['u', 'text goes here…', {}],
            ul: ['ul', "", {}, '\n'],
            wbr: ['wbr', false, {}]
        },
        source: {
            type: 'HTML'
        }
    };
    var toggle = that.toggle;
    var tagName = '[\\w:.-]+',
        tagStart = function tagStart(name) {
            return '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>';
        },
        tagEnd = function tagEnd(name) {
            return '</(' + name + ')>';
        };

    function isBlock(before, value, after) {
        return (!value || hasValue('\n', value)) && (!after || '\n' === after[0]) && (!before || '\n' === before.slice(-1));
    }

    function isValueDefaultBlocks(value, defaults) {
        return value === defaults.h1[1] || value === defaults.h2[1] || value === defaults.h3[1] || value === defaults.h4[1] || value === defaults.h5[1] || value === defaults.h6[1] || value === defaults.p[1];
    }

    function toggleBlocks(that) {
        var patternBefore = toPattern(tagStart('h([1-6])|p') + '$', 'i'),
            patternAfter = toPattern('^' + tagEnd('h[1-6]|p'), 'i');
        var _that$$ = that.$(),
            after = _that$$.after,
            end = _that$$.end,
            before = _that$$.before,
            start = _that$$.start,
            value = _that$$.value,
            state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = state.defaults || {};
        // Wrap current line if selection is empty
        if (!value) {
            var lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop();
            if (!lineAfter.trim() && !lineBefore.trim()) {
                that.insert(defaults.h1[1]);
            } else {
                that.select(start - toCount(lineBefore), end + toCount(lineAfter));
            }
            // Update!
            var v = that.$();
            after = v.after;
            before = v.before;
            end = v.end;
            start = v.start;
            value = v.value;
        }
        var lineMatch = before.split('\n').pop().match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "";
        that.match([patternBefore, /[\s\S]*/, patternAfter], function (before, value, after) {
            var h = +(before[2] || 0),
                attr = before[3] || "",
                element = before[1] ? defaults[before[1]] : ["", "", {}];
            if (!attr && element[2]) {
                attr = toAttributes(element[2]);
            }
            // ``
            that.replace(patternBefore, "", -1);
            that.replace(/\n+/g, ' ');
            that.replace(patternAfter, "", 1);
            if (!h) {
                // `<h1>`
                that.wrap(lineMatchIndent + '<' + defaults.h1[0] + (attr || toAttributes(defaults.h1[2])) + '>', '</' + defaults.h1[0] + '>');
                if (!value[0] || isValueDefaultBlocks(value[0], defaults)) {
                    that.insert(defaults.h1[1]);
                }
            } else {
                ++h;
                if (h > 6) {
                    // `<p>`
                    that.wrap(lineMatchIndent + '<' + defaults.p[0] + (attr || toAttributes(defaults.p[2])) + '>', '</' + defaults.p[0] + '>');
                    if (!value[0] || isValueDefaultBlocks(value[0], defaults)) {
                        that.insert(defaults.p[1]);
                    }
                } else {
                    // `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
                    that.wrap(lineMatchIndent + '<' + defaults['h' + h][0] + (attr || toAttributes(defaults['h' + h][2])) + '>', '</' + defaults['h' + h][0] + '>');
                    if (!value[0] || isValueDefaultBlocks(value[0], defaults)) {
                        that.insert(defaults['h' + h][1]);
                    }
                }
            }
            that.replace(toPattern('^(' + tagEnd('h[1-6]|p') + ')\\s*(' + tagEnd(tagName) + ')'), '$1\n' + lineMatchIndent.replace(toPattern('^' + charIndent), "") + '$3', 1);
        });
        // Unwrap selection from block element(s)
        that.replace(toPattern('^\\s*' + tagStart('blockquote|h[1-6]|p(re)?')), "");
        that.replace(toPattern(tagEnd('blockquote|h[1-6]|p(re)?') + '\\s*$'), "");
    }

    function toggleCodes(that) {
        var patternBefore = /<(p|pre|code)(?:\s[^>]*)?>(?:\s*<code(?:\s[^>]*)?>)?$/,
            patternAfter = /^(?:<\/code>\s*)?<\/(p|pre|code)>/;
        var _that$$2 = that.$(),
            after = _that$$2.after;
        _that$$2.end;
        var before = _that$$2.before;
        _that$$2.start;
        var value = _that$$2.value,
            state = that.state;
        state.source.tab || state.tab || '\t';
        var defaults = that.state.defaults || {};
        // Wrap current line if selection is empty
        // if (!value) {
        //     let lineAfter = after.split('\n').shift(),
        //         lineBefore = before.split('\n').pop();
        //     if (!lineAfter.trim() && !lineBefore.trim()) {
        //         that.insert(defaults.h1[1]);
        //     } else {
        //         that.select(start - toCount(lineBefore), end + toCount(lineAfter));
        //     }
        // }
        if (!value && isBlock(before, value, after)) {
            that.trim('\n', '\n');
            that.wrap('<' + defaults.pre[0] + toAttributes(defaults.pre[2]) + '><' + defaults.code[0] + toAttributes(defaults.code[2]) + '>', '</' + defaults.code[0] + '></' + defaults.pre[0] + '>').insert(fromHTML(defaults.code[1]));
        } else {
            that.match([patternBefore, /[\s\S]*/, patternAfter], function (before, value, after) {
                that.replace(patternBefore, "", -1);
                that.replace(patternAfter, "", 1);
                if (isBlock(before[0], value[0], after[0]) || defaults.p[0] === after[1] || defaults.pre[0] === after[1]) {
                    that.trim('\n', '\n');
                    // `<pre><code>…</code></pre>`
                    if (defaults.pre[0] === after[1]) {
                        that.wrap('<' + defaults.p[0] + toAttributes(defaults.p[2]) + '>', '</' + defaults.p[0] + '>').insert(toHTML(value[0]));
                        if (!value[0] || value[0] === defaults.code[1]) {
                            that.insert(defaults.p[1]);
                        }
                        // `<p>…</p>`
                    } else {
                        that.wrap('<' + defaults.pre[0] + toAttributes(defaults.pre[2]) + '><' + defaults.code[0] + toAttributes(defaults.code[2]) + '>', '</' + defaults.code[0] + '></' + defaults.pre[0] + '>').insert(fromHTML(value[0]));
                        if (!value[0] || value[0] === defaults.p[1]) {
                            that.insert(defaults.code[1]);
                        }
                    }
                } else if (defaults.code[0] === after[1]) {
                    that.insert(toHTML(value[0]));
                } else {
                    toggle.apply(that, [].concat(defaults.code, value && defaults.code[1] !== value ? false : ' '));
                }
            });
        }
    }

    function toggleQuotes(that) {
        var patternBefore = /<(blockquote)(?:\s[^>]*)?>\s*(<p(?:\s[^>]*)?>)?$/,
            patternAfter = /^(<\/p>)?\s*<\/(blockquote)>/;
        var _that$$3 = that.$(),
            after = _that$$3.after,
            end = _that$$3.end,
            before = _that$$3.before,
            start = _that$$3.start,
            value = _that$$3.value,
            state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = that.state.defaults || {};
        // Wrap current line if selection is empty
        if (!value) {
            var lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop();
            if (!lineAfter.trim() && !lineBefore.trim()) {
                that.insert(defaults.p[1]);
            } else {
                that.select(start - toCount(lineBefore), end + toCount(lineAfter));
            }
            // Update!
            var v = that.$();
            after = v.after;
            before = v.before;
            end = v.end;
            start = v.start;
            value = v.value;
        }
        var lineMatch = before.split('\n').pop().match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "";
        that.match([patternBefore, /[\s\S]*/, patternAfter], function (before, value, after) {
            // `<blockquote>…</blockquote>`
            if (defaults.blockquote[0] === after[1] || defaults.blockquote[0] === after[2]) {
                that.replace(patternBefore, "", -1);
                that.replace(patternAfter, "", 1);
                that.pull(charIndent);
            } else {
                // Check if selection contains block tag(s) or a line break
                if (hasValue('\n', value[0]) || /<\/(figure|form|dl|h[1-6]|[ou]l|p(re)?|table)>/i.test(value[0])) {
                    that.wrap(lineMatchIndent + '<' + defaults.blockquote[0] + toAttributes(defaults.blockquote[2]) + '>\n', '\n' + lineMatchIndent + '</' + defaults.blockquote[0] + '>');
                    that.push(charIndent);
                } else {
                    that.wrap(lineMatchIndent + '<' + defaults.blockquote[0] + toAttributes(defaults.blockquote[2]) + '>\n' + charIndent + '<' + defaults.p[0] + toAttributes(defaults.p[2]) + '>', '</' + defaults.p[0] + '>\n' + lineMatchIndent + '</' + defaults.blockquote[0] + '>');
                }
            }
        });
    }
    var commands = {};
    commands.blocks = function () {
        var that = this;
        return that.record(), toggleBlocks(that), that.record(), false;
    };
    commands.bold = function () {
        var that = this,
            state = that.state,
            defaults = state.defaults || {},
            _that$$4 = that.$(),
            value = _that$$4.value;
        return that.record(), toggle.apply(that, [].concat(defaults.b, value && defaults.b[1] !== value ? false : ' ')), false;
    };
    commands.code = function () {
        var that = this;
        return that.record(), toggleCodes(that), that.record(), false;
    };
    commands.image = function (label, placeholder) {
        if (label === void 0) {
            label = 'URL:';
        }
        var that = this,
            _that$$5 = that.$(),
            after = _that$$5.after,
            before = _that$$5.before,
            value = _that$$5.value,
            state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = state.defaults || {},
            lineBefore = before.split('\n').pop(),
            lineMatch = lineBefore.match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "",
            prompt = state.source.prompt;
        if (isFunction(prompt)) {
            prompt(label, value && /^https?:\/\/\S+$/.test(value) ? value : placeholder || protocol + '//').then(function (src) {
                if (!src) {
                    that.focus();
                    return;
                }
                var element = [].concat(defaults.img);
                if (value) {
                    element[2].alt = value;
                    that.record(); // Record selection
                }
                element[2].src = src;
                if (isBlock(before, value, after)) {
                    that.insert("").trim('\n', '\n');
                    that.wrap(lineMatchIndent + '<' + defaults.figure[0] + toAttributes(defaults.figure[2]) + '>\n' + lineMatchIndent + charIndent, lineMatchIndent + '\n</' + defaults.figure[0] + '>');
                    that.insert('<' + element[0] + toAttributes(element[2]) + '>\n' + lineMatchIndent + charIndent, -1);
                    that.wrap('<' + defaults.figcaption[0] + toAttributes(defaults.figcaption[2]) + '>', '</' + defaults.figcaption[0] + '>').insert(defaults.figcaption[1]);
                } else {
                    that.trim(' ', "").insert('<' + element[0] + toAttributes(element[2]) + '>' + (after ? ' ' : ""), -1, true);
                }
            }).catch(function (e) {
                return 0;
            });
        }
        return that.record(), false;
    };
    commands.italic = function () {
        var that = this,
            state = that.state,
            defaults = state.defaults || {},
            _that$$6 = that.$(),
            value = _that$$6.value;
        return that.record(), toggle.apply(that, [].concat(defaults.i, value && defaults.i[1] !== value ? false : ' ')), false;
    };
    commands.link = function (label, placeholder) {
        if (label === void 0) {
            label = 'URL:';
        }
        var that = this,
            _that$$7 = that.$(),
            after = _that$$7.after,
            end = _that$$7.end,
            before = _that$$7.before,
            value = _that$$7.value,
            state = that.state,
            defaults = state.defaults || {},
            prompt = state.source.prompt;
        if (isFunction(prompt)) {
            var element = [].concat(defaults.a),
                href,
                m,
                wrapped;
            if (m = toPattern(tagStart(element[0])).exec(before)) {
                wrapped = true;
                that.select(m.index + toCount(m[0]), end + after.indexOf('</' + element[0] + '>'));
                m = /\shref=(?:"([^"]+)"|'([^']+)'|([^>\/\s]+))/.exec(m[2]);
                href = toHTML((m[1] || "") + (m[2] || "") + (m[3] || ""));
            } else if (m = toPattern('^\\s*' + tagStart(element[0])).exec(value)) {
                m = /\shref=(?:"([^"]+)"|'([^']+)'|([^>\/\s]+))/.exec(m[2]);
                href = toHTML((m[1] || "") + (m[2] || "") + (m[3] || ""));
            }
            prompt(label, value && /^https?:\/\/\S+$/.test(value) ? value : href || placeholder || protocol + '//').then(function (href) {
                if (!href) {
                    that.focus();
                    return;
                }
                if (value) {
                    that.record(); // Record selection
                }
                element[2].href = href;
                var local = /[.\/?&#]/.test(href[0]) || /^(data|javascript|mailto):/.test(href) || !hasValue('://', href),
                    extras = {};
                if (!local) {
                    extras.rel = 'nofollow';
                    extras.target = '_blank';
                }
                if (wrapped) {
                    toggle.apply(that, [element[0]]); // Unwrap if already wrapped, then…
                }
                toggle.apply(that, [element[0], element[1], fromStates(extras, element[2]), value && element[1] !== value ? false : ' ']); // Wrap!
            }).catch(function (e) {
                return 0;
            });
        }
        return that.record(), false;
    };
    commands.quote = function () {
        var that = this;
        return that.record(), toggleQuotes(that), that.record(), false;
    };
    commands.underline = function () {
        var that = this,
            state = that.state,
            defaults = state.defaults || {},
            _that$$8 = that.$(),
            value = _that$$8.value;
        return that.record(), toggle.apply(that, [].concat(defaults.u, value && defaults.u[1] !== value ? false : ' ')), false;
    };

    function canKeyDown(map, that) {
        var state = that.state,
            charIndent = state.source.tab || state.tab || '\t',
            defaults = state.defaults || {},
            key = map.key,
            queue = map.queue;
        if (queue.Control) {
            var _that$$9 = that.$(),
                after = _that$$9.after,
                before = _that$$9.before,
                end = _that$$9.end,
                start = _that$$9.start;
            _that$$9.value;
            var lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop(),
                lineMatch = lineBefore.match(/^(\s+)/),
                lineMatchIndent = lineMatch && lineMatch[1] || "";
            if ('Enter' === key) {
                var _m = lineAfter.match(toPattern(tagEnd(tagName) + '\\s*$', "")),
                    element = defaults[_m && _m[1] || 'p'] || defaults.p;
                element[3] = ['\n' + lineMatchIndent, '\n' + (!queue.Shift && after && toPattern('^\\s*' + tagEnd(tagName)).test(after.split('\n')[1] || "") ? lineMatchIndent.replace(toPattern('^' + charIndent), "") : lineMatchIndent)];
                that.select(queue.Shift ? start - toCount(lineBefore) : end + toCount(lineAfter));
                toggle.apply(that, element);
                return that.record(), false;
            }
        }
        // Do nothing
        if (queue.Alt || queue.Control) {
            return true;
        }
        if ('>' === key) {
            var _that$$10 = that.$(),
                _after = _that$$10.after,
                _before = _that$$10.before,
                _end = _that$$10.end;
            _after.split('\n').shift();
            var _lineBefore = _before.split('\n').pop(),
                _lineMatch = _lineBefore.match(/^(\s+)/),
                _lineMatchIndent = _lineMatch && _lineMatch[1] || "",
                _m2 = (_lineBefore + '>').match(toPattern(tagStart(tagName) + '$', "")),
                _n,
                _element = defaults[_n = _m2 && _m2[1] || ""];
            if (!_n) {
                return true;
            }
            if (_element) {
                if (false !== _element[1]) {
                    if ('>' === _after[0]) {
                        that.select(_end + 1);
                    } else {
                        that.insert('>', -1);
                    }
                    that.insert('</' + _n + '>', 1).insert(_element[1]);
                    if ('blockquote' === _element[0]) {
                        that.insert(defaults.p[1]);
                        that.wrap('\n' + _lineMatchIndent + charIndent + '<' + defaults.p[0] + toAttributes(defaults.p[2]) + '>', '</' + defaults.p[0] + '>\n' + _lineMatchIndent);
                    } else if ('dl' === _element[0]) {
                        that.insert(defaults.dt[1]);
                        that.wrap('\n' + _lineMatchIndent + charIndent + '<' + defaults.dt[0] + toAttributes(defaults.dt[2]) + '>', '</' + defaults.dt[0] + '>\n' + _lineMatchIndent);
                    } else if ('ol' === _element[0] || 'ul' === _element[0]) {
                        that.insert(defaults.li[1]);
                        that.wrap('\n' + _lineMatchIndent + charIndent + '<' + defaults.li[0] + toAttributes(defaults.li[2]) + '>', '</' + defaults.li[0] + '>\n' + _lineMatchIndent);
                    } else if ('select' === _element[0]) {
                        that.insert(defaults.option[1]);
                        that.wrap('\n' + _lineMatchIndent + charIndent + '<' + defaults.option[0] + toAttributes(defaults.option[2]) + '>', '</' + defaults.option[0] + '>\n' + _lineMatchIndent);
                    } else if ('tbody' === _element[0] || 'tfoot' === _element[0] || 'thead' === _element[0]) {
                        that.insert(defaults.tr[1]);
                        that.wrap('\n' + _lineMatchIndent + charIndent + '<' + defaults.tr[0] + toAttributes(defaults.tr[2]) + '>', '</' + defaults.tr[0] + '>\n' + _lineMatchIndent);
                    }
                } else {
                    if ('>' === _after[0]) {
                        that.insert(' /', -1).select(_end + 3);
                    } else {
                        that.insert(' />', -1);
                    }
                }
            } else {
                if ('>' === _after[0]) {
                    that.select(_end + 1);
                } else {
                    that.insert('>', -1);
                }
                that.insert('</' + _n + '>', 1);
            }
            return that.record(), false;
        }
        if ('Enter' === key) {
            var _that$$11 = that.$(),
                _after2 = _that$$11.after,
                _before2 = _that$$11.before,
                _value = _that$$11.value,
                _lineAfter2 = _after2.split('\n').shift(),
                _lineBefore2 = _before2.split('\n').pop(),
                _lineMatch2 = _lineBefore2.match(/^(\s+)/),
                _lineMatchIndent2 = _lineMatch2 && _lineMatch2[1] || "",
                _m3,
                _n2;
            var continueOnEnterTags = ['dd', 'li', 'option', 'p', 'td', 'th'],
                noIndentOnEnterTags = ['pre', 'script', 'style'];
            if (_m3 = _lineBefore2.match(toPattern(tagStart(tagName) + '$', ""))) {
                var _element2 = defaults[_m3[1]];
                if (_element2 && false === _element2[1]) {
                    return that.insert('\n' + _lineMatchIndent2, -1).record(), false;
                }
            }
            // `<br>`
            if (queue.Shift) {
                var br = defaults.br;
                return that.insert('<' + br[0] + toAttributes(br[2]) + '>' + (false === br[1] ? "" : br[1] + '</' + br[0] + '>') + '\n', -1).record(), false;
            }
            if (_after2 && _before2) {
                if (_lineAfter2.startsWith('</' + defaults.dt[0] + '>') && _lineBefore2.match(toPattern('^\\s*' + tagStart(defaults.dt[0]), ""))) {
                    if (_value && defaults.dt[1] === _value) {
                        that.insert("").wrap('\n' + _lineMatchIndent2 + charIndent, '\n' + _lineMatchIndent2);
                        // Insert definition data below!
                    } else {
                        that.insert('</' + defaults.dt[0] + '>\n' + _lineMatchIndent2 + '<' + defaults.dd[0] + toAttributes(defaults.dd[2]) + '>', -1).replace(toPattern('^' + tagEnd(defaults.dt[0])), '</' + defaults.dd[0] + '>', 1).insert(defaults.dd[1]);
                    }
                    return that.record(), false;
                }
                for (var i = 0, j = toCount(continueOnEnterTags); i < j; ++i) {
                    _n2 = continueOnEnterTags[i];
                    if (toPattern('^' + tagEnd(_n2), "").test(_lineAfter2) && (_m3 = _lineBefore2.match(toPattern('^\\s*' + tagStart(_n2), "")))) {
                        // `<foo>|</foo>`
                        if (_m3[0] === _lineBefore2) {
                            if (defaults[_n2] && _value && defaults[_n2][1] === _value) {
                                that.insert("").wrap('\n' + _lineMatchIndent2 + charIndent, '\n' + _lineMatchIndent2);
                                // Unwrap if empty!
                            } else {
                                toggle.apply(that, [_n2]);
                            }
                            return that.record(), false;
                        }
                        // `<foo>bar|</foo>`
                        return that.insert('</' + _n2 + '>\n' + _lineMatchIndent2 + '<' + _n2 + (_m3[2] || "") + '>', -1).insert(defaults[_n2] ? defaults[_n2][1] || "" : "").record(), false;
                    }
                }
                for (var _i = 0, _j = toCount(noIndentOnEnterTags); _i < _j; ++_i) {
                    _n2 = noIndentOnEnterTags[_i];
                    if (toPattern('^' + tagEnd(_n2), "").test(_lineAfter2) && toPattern(tagStart(_n2) + '$', "").test(_lineBefore2)) {
                        return that.wrap('\n' + _lineMatchIndent2, '\n' + _lineMatchIndent2).insert(defaults[_n2] ? defaults[_n2][1] || "" : "").record(), false;
                    }
                }
                for (var _i2 = 1; _i2 < 7; ++_i2) {
                    if (_lineAfter2.startsWith('</' + defaults['h' + _i2][0] + '>') && _lineBefore2.match(toPattern('^\\s*' + tagStart(defaults['h' + _i2][0]), ""))) {
                        if (defaults['h' + _i2] && _value && defaults['h' + _i2][1] === _value) {
                            that.insert("").wrap('\n' + _lineMatchIndent2 + charIndent, '\n' + _lineMatchIndent2);
                            // Insert paragraph below!
                        } else {
                            that.insert('</' + defaults['h' + _i2][0] + '>\n' + _lineMatchIndent2 + '<' + defaults.p[0] + toAttributes(defaults.p[2]) + '>', -1).replace(toPattern('^' + tagEnd(defaults['h' + _i2][0])), '</' + defaults.p[0] + '>', 1).insert(defaults.p[1]);
                        }
                        return that.record(), false;
                    }
                }
            }
        }
        return true;
    }
    var state = defaults;
    exports.canKeyDown = canKeyDown;
    exports.commands = commands;
    exports.state = state;
    Object.defineProperty(exports, '__esModule', {
        value: true
    });
}));