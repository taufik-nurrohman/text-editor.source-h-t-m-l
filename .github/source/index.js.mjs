import {W} from '@taufik-nurrohman/document';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {fromHTML, fromStates, fromValue} from '@taufik-nurrohman/from';
import {isFunction, isString} from '@taufik-nurrohman/is';
import {that} from '@taufik-nurrohman/text-editor.source-x-m-l';
import {toCount} from '@taufik-nurrohman/to';

const defaults = {
    sourceHTML: {
        input: (key, value) => W.prompt(key, value),
        object: {
            a: ['a', 'link text goes here…', {}],
            area: ['area', false, {}],
            b: ['strong', 'text goes here…', {}],
            base: ['base', false, {}, '\n'],
            blockquote: ['blockquote', "", {}, '\n'],
            br: ['br', false, {}, ["", '\n']],
            code: ['code', 'code goes here…', {}, ' '],
            col: ['col', false, {}, '\n'],
            em: ['em', 'text goes here…', {}],
            h1: ['h1', 'title goes here…', {}, '\n'],
            h2: ['h2', 'title goes here…', {}, '\n'],
            h3: ['h3', 'title goes here…', {}, '\n'],
            h4: ['h4', 'title goes here…', {}, '\n'],
            h5: ['h5', 'title goes here…', {}, '\n'],
            h6: ['h6', 'title goes here…', {}, '\n'],
            hr: ['hr', false, {}, '\n'],
            i: ['em', 'text goes here…', {}],
            img: ['img', false, {alt: ""}, ' '],
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
            strong: ['strong', 'text goes here…', {}],
            td: ['td', "", {}, '\n'],
            th: ['th', "", {}, '\n'],
            tr: ['tr', "", {}, '\n'],
            track: ['track', false, {}, '\n'],
            u: ['u', 'text goes here…', {}],
            ul: ['ul', "", {}, '\n'],
            wbr: ['wbr', false, {}, ["", '\n']]
        }
    }
};

const {toggle} = that;

let tagComment = '<!--([\\s\\S](?!-->)*)-->',
    tagName = '[\\w:.-]+',
    tagStart = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>',
    tagEnd = name => '</(' + name + ')>',
    tagVoid = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?/?>';

function toAttributes(attributes) {
    if (!attributes) {
        return "";
    }
    let attribute, out = "";
    for (attribute in attributes) {
        out += ' ' + attribute + '="' + fromHTML(fromValue(attributes[attribute])) + '"';
    }
    return out;
}

function toggleBlocks(editor) {
    let patternBefore = /<(?:h([1-6])|p)(\s[^>]*)?>$/,
        patternAfter = /^<\/(?:h[1-6]|p)>/;
    editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
        let t = this,
            h = +(before[1] || 0),
            attr = before[2] || "",
            object = editor.state.sourceHTML.object || {},
            element = before[0] ? object[before[0].slice(1, -1).split(/\s/)[0]] : ["", "", {}, ["", ""]];
        if (!attr && element[2]) {
            attr = toAttributes(element[2]);
        }
        // ``
        t.replace(patternBefore, "", -1);
        t.replace(patternAfter, "", 1);
        let tidy = element[3];
        if (false !== tidy) {
            if (isString(tidy)) {
                tidy = [tidy, tidy];
            } else {
                tidy = ["", ""];
            }
            t.trim(tidy[0], tidy[1] || tidy[0]);
        }
        if (!h) {
            // `<h1>`
            t.wrap('<' + object.h1[0] + (attr || toAttributes(object.h1[2])) + '>', '</' + object.h1[0] + '>');
            if (!value[0] || value[0] === object.p[1]) {
                t.insert(object.h1[1]);
            }
        } else {
            ++h;
            if (h > 6) {
                // `<p>`
                t.wrap('<' + object.p[0] + (attr || toAttributes(object.p[2])) + '>', '</' + object.p[0] + '>');
                if (!value[0] || value[0] === object.h6[1]) {
                    t.insert(object.p[1]);
                }
            } else {
                // `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
                t.wrap('<' + object['h' + h][0] + (attr || toAttributes(object['h' + h][2])) + '>', '</' + object['h' + h][0] + '>');
                if (!value[0] || value[0] === object.p[1]) {
                    t.insert(object['h' + h][1]);
                }
            }
        }
    });
}

function toggleCodes(editor) {
    let patternBefore = /<(?:pre|code)(?:\s[^>]*)?>(?:\s*<code(?:\s[^>]*)?>)?$/,
        patternAfter = /^(?:<\/code>\s*)?<\/(?:pre|code)>/;
    editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
        let t = this, tidy,
            object = editor.state.sourceHTML.object,
            attrCode = toAttributes(object.code[2]),
            attrPre = toAttributes(object.pre[2]);
        // ``
        t.replace(patternBefore, "", -1);
        t.replace(patternAfter, "", 1);
        if (after[0]) {
            // ``
            if (/^(?:<\/code>\s*)?<\/pre>/.test(after[0])) {
                t.trim("", "").insert(decode(editor.$().value));
            // `<pre><code> … </code></pre>`
            } else if (after[0].slice(0, 7) === '</' + object.code[0] + '>') {
                tidy = object.pre[3];
                if (false !== tidy) {
                    if (isString(tidy)) {
                        tidy = [tidy, tidy];
                    } else {
                        tidy = ["", ""];
                    }
                    t.trim(tidy[0], tidy[1] || tidy[0]);
                }
                t.wrap('<' + object.pre[0] + attrPre + '><' + object.code[0] + attrCode + '>', '</' + object.code[0] + '></' + object.pre[0] + '>');
            }
        // `<code> … </code>`
        } else {
            tidy = object.code[3];
            if (false !== tidy) {
                if (isString(tidy)) {
                    tidy = [tidy, tidy];
                } else {
                    tidy = ["", ""];
                }
                t.trim(tidy[0], tidy[1] || tidy[0]);
            }
            t.wrap('<' + object.code[0] + attrCode + '>', '</' + object.code[0] + '>').insert(encode(editor.$().value || object.code[1]));
        }
    });
}

function encode(x) {
    return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function decode(x) {
    return x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

export function canKeyDown(key, {a, c, s}, that) {
    let state = that.state,
        object = state.sourceHTML.object || {},
        charAfter,
        charBefore,
        charIndent = state.sourceHTML.tab || state.tab || '\t',
        input = state.sourceHTML.input;
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
                        if (isString(tidy)) {
                            tidy = [tidy, tidy];
                        } else {
                            tidy = ["", ""];
                        }
                    }
                    that.trim(tidy[0], "");
                    // TODO: Generate attribute(s)
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
            let {after, before, end, start, value} = that.$(),
                lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop(),
                lineMatch = lineBefore.match(/^(\s+)/),
                lineMatchIndent = lineMatch && lineMatch[1] || "", m;
                m = lineAfter.match(toPattern(tagEnd(tagName) + '\\s*$', ""));
            let name = m && m[1] || object.p[0];
            if (s) {
                that.select(start - toCount(lineBefore));
                toggle.apply(that, object[name] || object.p);
                that.replace(toPattern('^(' + tagEnd(tagName) + ')\\s*(.)', ""), '$1\n' + lineMatchIndent + '$3', 1);
                that.replace(toPattern('(^|\\n)\\s*(' + tagStart(tagName) + ')$', ""), '$1' + lineMatchIndent + '$2', -1);
                return that.record(), false;
            }
            that.select(end + toCount(lineAfter));
            toggle.apply(that, object[name] || object.p);
            that.replace(toPattern('(.)\\s*(' + tagStart(tagName) + ')$', ""), '$1\n' + lineMatchIndent + '$2', -1);
            return that.record(), false;
        }
    }
    // Do nothing
    if (a || c) {
        return true;
    }
    if ('>' === key) {
        // TODO
    }
    if ('Enter' === key) {
        let {after, before, value} = that.$(),
            lineAfter = after.split('\n').shift(),
            lineBefore = before.split('\n').pop(),
            lineMatch = lineBefore.match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "", m;
        if (!value) {
            if (after && before) {
                let continueable = ['li', 'option', 'p', 'td', 'th'], n;
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
                        }
                        // `<asdf>asdf|</asdf>`
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

export const state = defaults;
