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
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.TE = global.TE || {}, global.TE.SourceHTML = factory()));
})(this, function() {
    'use strict';
    var isArray = function isArray(x) {
        return Array.isArray(x);
    };
    var isDefined = function isDefined(x) {
        return 'undefined' !== typeof x;
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
    var fromHTML = function fromHTML(x) {
        return x.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
    };
    var fromStates = function fromStates() {
        for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
            lot[_key] = arguments[_key];
        }
        return Object.assign.apply(Object, [{}].concat(lot));
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
    that.toggle = function(name, content, attributes) {
        if (content === void 0) {
            content = "";
        }
        if (attributes === void 0) {
            attributes = {};
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
        return t.wrap('<' + name + toAttributes(attributes) + '>', '</' + name + '>');
    };
    const defaults = {
        elements: {
            a: ['a', 'link text goes here…', {}],
            b: ['strong', 'text goes here…', {}],
            code: ['code', 'code goes here…', {}],
            h1: ['h1', 'title goes here…', {}],
            h2: ['h2', 'title goes here…', {}],
            h3: ['h3', 'title goes here…', {}],
            h4: ['h4', 'title goes here…', {}],
            h5: ['h5', 'title goes here…', {}],
            h6: ['h6', 'title goes here…', {}],
            i: ['em', 'text goes here…', {}],
            img: ['img', false, {
                alt: ""
            }],
            pre: ['pre', 'text goes here…', {}],
            u: ['u', 'text goes here…', {}]
        }
    };
    const {
        toggle
    } = that;
    let tagStart = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>',
        tagEnd = name => '</(' + name + ')>';

    function canKeyDown(key, {
        a,
        c,
        s
    }, that) {
        let state = fromStates({}, defaults, that),
            elements = state.elements;
        state.tab || '\t';
        if (c) {
            if ('b' === key) {
                return toggle.apply(that, elements.b), false;
            }
            if ('i' === key) {
                return toggle.apply(that, elements.i), false;
            }
            if ('u' === key) {
                return toggle.apply(that, elements.u), false;
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
                    if ('</li>' === lineAfter && (m = lineBefore.match(toPattern('^\\s*' + tagStart('li'), "")))) {
                        return that.insert('</li>\n' + lineMatchIndent + '<li' + (m[2] || "") + '>', -1).record(), false;
                    }
                    if ('</p>' === lineAfter && (m = lineBefore.match(toPattern('^\\s*' + tagStart('p'), "")))) {
                        return that.insert('</p>\n' + lineMatchIndent + '<p' + (m[2] || "") + '>', -1), false;
                    }
                    for (let i = 1; i < 7; ++i) {
                        if ('</h' + i + '>' === lineAfter && lineBefore.match(toPattern('^\\s*' + tagStart('h' + i), ""))) {
                            return that.insert('</h' + i + '>\n' + lineMatchIndent + '<p>', -1).replace(toPattern('^' + tagEnd('h' + i)), '</p>', 1).record(), false;
                        }
                    }
                }
            }
        }
        return true;
    }
    var _virtual_entry = {
        canKeyDown,
        state: defaults,
        that
    };
    return _virtual_entry;
});