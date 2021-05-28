import {fromHTML, fromStates, fromValue} from '@taufik-nurrohman/from';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {that} from '@taufik-nurrohman/text-editor.source-x-m-l';
import {toCount} from '@taufik-nurrohman/to';

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

const {toggle} = that;

let tagComment = '<!--([\\s\\S]*?)-->',
    tagName = '[\\w:.-]+',
    tagStart = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>',
    tagEnd = name => '</(' + name + ')>',
    tagVoid = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?/?>';

function canKeyDown(key, {a, c, s}, that) {
    let state = fromStates({}, defaults, that),
        elements = state.elements,
        charAfter,
        charBefore,
        charIndent = state.tab || '\t';
    if (c) {
        if ('b' === key) {
            return toggle.apply(that, elements.b), false;
        }
        if ('h' === key) {

        }
        if ('i' === key) {
            return toggle.apply(that, elements.i), false;
        }
        if ('k' === key) {

        }
        if ('l' === key) {

        }
        if ('u' === key) {
            return toggle.apply(that, elements.u), false;
        }
    }
    // Do nothing
    if (a || c) {
        return true;
    }
    if ('Enter' === key) {
        let {after, before, value} = that.$(),
            lineAfter = after.split('\n').shift(),
            lineBefore = before.split('\n').pop(),
            lineMatch = lineBefore.match(/^(\s+)/),
            lineMatchIndent = lineMatch && lineMatch[1] || "", m;
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

export default {
    canKeyDown,
    state: defaults,
    that
};
