import {W} from '@taufik-nurrohman/document';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {fromHTML, fromValue} from '@taufik-nurrohman/from';
import {isFunction, isString} from '@taufik-nurrohman/is';
import {that} from '@taufik-nurrohman/text-editor.source-x-m-l';
import {toCount} from '@taufik-nurrohman/to';

const defaults = {
    sourceHTML: {
        input: (key, value) => W.prompt(key, value),
        object: {
            a: ['a', 'link text goes here…', {}, ""],
            area: ['area', false, {}, ""],
            b: ['strong', 'text goes here…', {}, ""],
            base: ['base', false, {href: ""}, '\n'],
            blockquote: ['blockquote', "", {}, '\n'],
            br: ['br', false, {}, ["", '\n']],
            button: ['button', 'text goes here…', {name: "", type: 'submit'}, ' '],
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
            img: ['img', false, {alt: "", src: ""}, ' '],
            input: ['input', false, {name: "", type: 'text'}, ' '],
            li: ['li', "", {}, '\n'],
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
            strong: ['strong', 'text goes here…', {}, ""],
            style: ['style', "", {}, '\n'],
            td: ['td', "", {}, '\n'],
            textarea: ['textarea', 'text goes here…', {name: ""}, ' '],
            th: ['th', "", {}, '\n'],
            tr: ['tr', "", {}, '\n'],
            track: ['track', false, {}, '\n'],
            u: ['u', 'text goes here…', {}, ""],
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

function toggleBlocks(editor) {
    let patternBefore = /<(?:h([1-6])|p)(\s[^>]*)?>$/,
        patternAfter = /^<\/(?:h[1-6]|p)>/;
    editor.match([patternBefore, /.*/, patternAfter], function(before, value, after) {
        let t = this,
            h = +(before[1] || 0),
        attr = before[2] || "";
        // ``
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
        let t = this;
        // ``
        t.replace(patternBefore, "", -1);
        t.replace(patternAfter, "", 1);
        if (after[0]) {
            // ``
            if (/^(?:<\/code>\s*)?<\/pre>/.test(after[0])) {
                t.trim(' ', ' ').insert(decode(editor.$().value));
            // `<pre><code> … </code></pre>`
            } else if (after[0].slice(0, 7) === '</code>') {
                t.trim('\n', '\n').wrap('<pre><code>', '</code></pre>');
            }
        // `<code> … </code>`
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

export function canKeyDown(key, {a, c, s}, that) {
    let state = that.state,
        object = state.sourceHTML?.object || {},
        charAfter,
        charBefore,
        charIndent = state.sourceHTML?.tab || state.tab || '\t',
        input = state.sourceHTML?.input;
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
                            // Unwrap again if empty!
                            that.replace(toPattern(tagStart(n) + '$', ""), "", -1);
                            that.replace(toPattern('^' + tagEnd(n), ""), "", 1);
                            return that.record(), false;
                        }
                        // `<asdf>asdf|</asdf>`
                        return that.insert('</' + n + '>\n' + lineMatchIndent + '<' + n + (m[2] || "") + '>', -1).record(), false;
                    }
                }
                let noIndentOnEnterTags = ['script', 'style'];
                for (let i = 0, j = toCount(noIndentOnEnterTags); i < j; ++i) {
                    n = noIndentOnEnterTags[i];
                    if (toPattern('^' + tagEnd(n), "").test(lineAfter) && toPattern(tagStart(n) + '$', "").test(lineBefore)) {
                        return that.wrap('\n' + lineMatchIndent, '\n').record(), false;
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
