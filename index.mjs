import {W} from '@taufik-nurrohman/document';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {fromHTML, fromValue} from '@taufik-nurrohman/from';
import {isArray, isFunction, isSet, isString} from '@taufik-nurrohman/is';
import {that} from '@taufik-nurrohman/text-editor.source-x-m-l';
import {toCount} from '@taufik-nurrohman/to';

const defaults = {
    source: {
        type: 'HTML'
    },
    sourceHTML: {
        elements: {
            a: ['a', 'link text goes here…', {}],
            area: ['area', false, {}],
            b: ['strong', 'text goes here…', {}],
            base: ['base', false, {href: ""}, '\n'],
            blockquote: ['blockquote', "", {}, '\n'],
            br: ['br', false, {}, ["", '\n']],
            button: ['button', 'text goes here…', {name: "", type: 'submit'}, ' '],
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
            img: ['img', false, {alt: "", src: ""}, ' '],
            input: ['input', false, {name: "", type: 'text'}, ' '],
            li: ['li', 'list item goes here…', {}, '\n'],
            link: ['link', false, {href: ""}, '\n'],
            meta: ['meta', false, {}, '\n'],
            ol: ['ol', "", {}, '\n'],
            option: ['option', 'option goes here…', {}, '\n'],
            p: ['p', 'paragraph goes here…', {}, '\n'],
            param: ['param', false, {name: ""}, '\n'],
            pre: ['pre', 'text goes here…', {}, '\n'],
            script: ['script', "", {}, '\n'],
            select: ['select', "", {name: ""}, ' '],
            source: ['source', false, {src: ""}, '\n'],
            strong: ['strong', 'text goes here…', {}],
            style: ['style', "", {}, '\n'],
            td: ['td', 'data goes here…', {}, '\n'],
            textarea: ['textarea', 'text goes here…', {name: ""}, ' '],
            th: ['th', 'title goes here…', {}, '\n'],
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
            element = before[0] ? elements[before[0].slice(1, -1).split(/\s/)[0]] : ["", "", {}, ["", ""]];
        if (!attr && element[2]) {
            attr = toAttributes(element[2]);
        }
        // ``
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
        let t = this, tidy,
            elements = editor.state.sourceHTML.elements,
            attrCode = toAttributes(elements.code[2]),
            attrPre = toAttributes(elements.pre[2]);
        // ``
        t.replace(patternBefore, "", -1);
        t.replace(patternAfter, "", 1);
        if (after[0]) {
            // ``
            if (/^(?:<\/code>\s*)?<\/pre>/.test(after[0])) {
                t.trim("", "").insert(decode(editor.$().value));
            // `<pre><code> … </code></pre>`
            } else if (after[0].slice(0, 7) === '</' + elements.code[0] + '>') {
                tidy = elements.pre[3];
                if (false !== (tidy = toTidy(tidy))) {
                    t.trim(tidy[0], tidy[1]);
                }
                t.wrap('<' + elements.pre[0] + attrPre + '><' + elements.code[0] + attrCode + '>', '</' + elements.code[0] + '></' + elements.pre[0] + '>');
            }
        // `<code> … </code>`
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

export function canKeyDown(key, {a, c, s}, that) {
    let state = that.state,
        charAfter,
        charBefore,
        charIndent = state.sourceHTML.tab || state.tab || '\t',
        elements = state.sourceHTML.elements || {},
        prompt = state.source.prompt;
    if (c) {
        let {after, before, end, start, value} = that.$(),
            lineAfter = after.split('\n').shift(),
            lineBefore = before.split('\n').pop(),
            lineMatch = lineBefore.match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "", m;
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
            lineMatchIndent = lineMatch && lineMatch[1] || "", m, n;
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
                        }
                        // `<asdf>asdf|</asdf>`
                        return that.insert('</' + n + '>\n' + lineMatchIndent + '<' + n + (m[2] || "") + '>', -1).insert(elements[n] ? (elements[n][1] || "") : "").record(), false;
                    }
                }
                let noIndentOnEnterTags = ['script', 'style'];
                for (let i = 0, j = toCount(noIndentOnEnterTags); i < j; ++i) {
                    n = noIndentOnEnterTags[i];
                    if (toPattern('^' + tagEnd(n), "").test(lineAfter) && toPattern(tagStart(n) + '$', "").test(lineBefore)) {
                        return that.wrap('\n' + lineMatchIndent, '\n' + lineMatchIndent).insert(elements[n] ? (elements[n][1] || "") : "").record(), false;
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

export const state = defaults;
