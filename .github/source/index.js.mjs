import {W} from '@taufik-nurrohman/document';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {fromHTML, fromStates, fromValue} from '@taufik-nurrohman/from';
import {that} from '@taufik-nurrohman/text-editor.source-x-m-l';
import {toCount} from '@taufik-nurrohman/to';

const defaults = {
    source: {
        prompt: (key, value) => W.prompt(key, value)
    },
    sourceHTML: {
        elements: {
            a: ['a', 'link text goes here…', {}],
            area: ['area', false, {}],
            b: ['strong', 'text goes here…', {}],
            base: ['base', false, {}],
            blockquote: ['blockquote', "", {}],
            br: ['br', false, {}],
            code: ['code', 'code goes here…', {}],
            col: ['col', false, {}],
            em: ['em', 'text goes here…', {}],
            h1: ['h1', 'title goes here…', {}],
            h2: ['h2', 'title goes here…', {}],
            h3: ['h3', 'title goes here…', {}],
            h4: ['h4', 'title goes here…', {}],
            h5: ['h5', 'title goes here…', {}],
            h6: ['h6', 'title goes here…', {}],
            hr: ['hr', false, {}],
            i: ['em', 'text goes here…', {}],
            img: ['img', false, {alt: ""}],
            input: ['input', false, {}],
            li: ['li', "", {}],
            link: ['link', false, {}],
            meta: ['meta', false, {}],
            ol: ['ol', "", {}],
            option: ['option', 'option goes here…', {}],
            p: ['p', 'paragraph goes here…', {}],
            param: ['param', false, {}],
            pre: ['pre', 'text goes here…', {}],
            source: ['source', false, {}],
            strong: ['strong', 'text goes here…', {}],
            td: ['td', "", {}],
            th: ['th', "", {}],
            tr: ['tr', "", {}],
            track: ['track', false, {}],
            u: ['u', 'text goes here…', {}],
            ul: ['ul', "", {}],
            wbr: ['wbr', false, {}]
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
        elements = state.sourceHTML?.elements || {},
        charAfter,
        charBefore,
        charIndent = state.tab || '\t';
    if (c) {
        if ('b' === key) {
            return toggle.apply(that, elements.b), false;
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

        }
        if ('u' === key) {
            return toggle.apply(that, elements.u), false;
        }
        if ('Enter' === key) {
            let {after, before, end, start, value} = that.$(),
                lineAfter = after.split('\n').shift(),
                lineBefore = before.split('\n').pop(),
                lineMatch = lineBefore.match(/^(\s+)/),
                lineMatchIndent = lineMatch && lineMatch[1] || "", m;
            if ("" === value) {
                m = lineAfter.match(toPattern(tagEnd(tagName) + '\\s*$', ""));
                let n = m && m[1] || elements.p[0];
                if (s) {
                    that.select(start - toCount(lineBefore));
                    toggle.apply(that, elements[n] || elements.p);
                    that.replace(toPattern('^(' + tagEnd(tagName) + ')\\s*(.)', ""), '$1\n' + lineMatchIndent + '$3', 1);
                    that.replace(toPattern('(^|\\n)\\s*(' + tagStart(tagName) + ')$', ""), '$1' + lineMatchIndent + '$2', -1);
                    return that.record(), false;
                }
                that.select(end + toCount(lineAfter));
                toggle.apply(that, elements[n] || elements.p);
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
            lineMatchIndent = lineMatch && lineMatch[1] || "", m;
        if (!value) {
            if (after && before) {
                let continueable = ['li', 'option', 'p', 'td', 'th'], n;
                for (let i = 0, j = toCount(continueable); i < j; ++i) {
                    if (!(n = elements[continueable[i]])) {
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
                    if ('</' + elements['h' + i][0] + '>' === lineAfter && lineBefore.match(toPattern('^\\s*' + tagStart(elements['h' + i][0]), ""))) {
                        return that.insert('</' + elements['h' + i][0] + '>\n' + lineMatchIndent + '<' + elements.p[0] + '>', -1).replace(toPattern('^' + tagEnd(elements['h' + i][0])), '</' + elements.p[0] + '>', 1).record(), false;
                    }
                }
            }
        }
    }
    return true;
}

export const state = defaults;
