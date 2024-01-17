/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2024 Taufik Nurrohman <https://github.com/taufik-nurrohman>
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
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f) : (g = typeof globalThis !== 'undefined' ? globalThis : g || self, (g.TextEditor = g.TextEditor || {}, g.TextEditor.SourceHTML = f()));
})(this, (function () {
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
    var elements = {
        "": ["", 'text goes here…'],
        a: ['a', 'link text goes here…', {
            href: ""
        }],
        area: ['area', false],
        b: ['strong', 'text goes here…'],
        base: ['base', false, {
            href: ""
        }],
        blockquote: ['blockquote', 'quote goes here…'],
        br: ['br', false],
        button: ['button', 'text goes here…', {
            name: "",
            type: 'submit'
        }],
        caption: ['caption', 'table caption goes here…'],
        code: ['code', 'code goes here…'],
        col: ['col', false],
        dd: ['dd', 'data goes here…'],
        dl: ['dl', ""],
        dt: ['dt', 'title goes here…'],
        em: ['em', 'text goes here…'],
        figcaption: ['figcaption', 'image caption goes here…'],
        figure: ['figure', ""],
        h1: ['h1', 'title goes here…'],
        h2: ['h2', 'title goes here…'],
        h3: ['h3', 'title goes here…'],
        h4: ['h4', 'title goes here…'],
        h5: ['h5', 'title goes here…'],
        h6: ['h6', 'title goes here…'],
        hr: ['hr', false],
        i: ['em', 'text goes here…'],
        img: ['img', false, {
            alt: "",
            src: ""
        }],
        input: ['input', false, {
            name: "",
            type: 'text'
        }],
        li: ['li', 'list item goes here…'],
        link: ['link', false, {
            href: ""
        }],
        meta: ['meta', false],
        ol: ['ol', ""],
        option: ['option', 'option goes here…'],
        p: ['p', 'paragraph goes here…'],
        param: ['param', false, {
            name: ""
        }],
        pre: ['pre', 'text goes here…'],
        q: ['q', 'quote goes here…'],
        script: ['script', 'code goes here…'],
        select: ['select', "", {
            name: ""
        }],
        source: ['source', false, {
            src: ""
        }],
        strong: ['strong', 'text goes here…'],
        style: ['style', 'code goes here…'],
        tbody: ['tbody', ""],
        td: ['td', 'data goes here…'],
        textarea: ['textarea', 'value goes here…', {
            name: ""
        }],
        tfoot: ['tfoot', ""],
        th: ['th', 'title goes here…'],
        thead: ['thead', ""],
        tr: ['tr', ""],
        track: ['track', false],
        u: ['u', 'text goes here…'],
        ul: ['ul', ""],
        wbr: ['wbr', false]
    };
    var tagEnd = function tagEnd(name) {
            return '</(' + name + ')>';
        },
        tagName = function tagName() {
            return '[\\w:.-]+';
        },
        tagStart = function tagStart(name) {
            return '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>';
        };

    function onKeyDown(e) {
        var $ = this;
        $.k(false).pop();
        var keys = $.k();
        if (!$ || e.defaultPrevented) {
            return;
        }
        if ($.keys[keys]) {
            return;
        }
    }

    function attach() {
        var _$$state$source;
        var $ = this,
            m;
        $.state = fromStates({
            elements: elements
        }, $.state);
        $.insertImage = function (hint, value, then) {
            return $.prompt(hint != null ? hint : 'URL:', value != null ? value : theLocation.protocol + '//', function (value) {
                var _$$state$elements$img, _element$, _element$2, _element$2$alt;
                if (!value) {
                    return $;
                }
                var alt = $.$().value,
                    element = (_$$state$elements$img = $.state.elements.img) != null ? _$$state$elements$img : [];
                element[0] = (_element$ = element[0]) != null ? _element$ : 'img';
                element[1] = (_element$2 = element[1]) != null ? _element$2 : "";
                element[2] = fromStates({}, element[2] || {});
                element[2].alt = alt || ((_element$2$alt = element[2].alt) != null ? _element$2$alt : "");
                element[2].src = value;
                $.record().insertElement(element).record();
                isFunction(then) && then.call($, value);
            });
        };
        $.insertLink = function (hint, value, then) {
            return $.prompt(hint != null ? hint : 'URL:', value != null ? value : theLocation.protocol + '//', function (value) {
                var _$$state$elements$a, _element$3, _element$4;
                if (!value) {
                    return $;
                }
                var element = (_$$state$elements$a = $.state.elements.a) != null ? _$$state$elements$a : [];
                element[0] = (_element$3 = element[0]) != null ? _element$3 : 'a';
                element[1] = (_element$4 = element[1]) != null ? _element$4 : "";
                element[2] = fromStates({}, element[2] || {});
                element[2].href = value;
                $.record().wrapElement(element).record();
                isFunction(then) && then.call($, value);
            });
        };
        $.toggleElementBlock = function (open, close, wrap) {
            if (isString(open) && (m = toPattern('^' + tagStart(tagName()) + '$', "").exec(open))) {
                open = [m[1]];
            }
            var _$$$ = $.$(),
                after = _$$$.after,
                before = _$$$.before,
                value = _$$$.value;
            if (!wrap && !toPattern(tagStart(open[0]) + '$', "").test(before) && !toPattern('^' + tagEnd(open[0]), "").test(after) || wrap && !toPattern('^' + tagStart(open[0]) + '[\\s\\S]*?' + tagEnd(open[0]) + '$', "").test(value)) {
                $.trim('\n', '\n');
            }
            return $.toggleElement(open, close, wrap);
        };
        if ('HTML' === ((_$$state$source = $.state.source) == null ? void 0 : _$$state$source.type)) {
            $.on('key.down', onKeyDown);
        }
        return $;
    }

    function detach() {
        return this.off('key.down', onKeyDown);
    }
    var index_js = {
        attach: attach,
        detach: detach
    };
    return index_js;
}));