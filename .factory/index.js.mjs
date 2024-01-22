import {W, theLocation} from '@taufik-nurrohman/document';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {fromHTML, fromStates, fromValue} from '@taufik-nurrohman/from';
import {hasValue} from '@taufik-nurrohman/has';
import {isArray, isFunction, isInteger, isSet, isString} from '@taufik-nurrohman/is';
import {offEventDefault} from '@taufik-nurrohman/event';
import {that, toAttributes} from '@taufik-nurrohman/text-editor.source-x-m-l';
import {toCount, toHTML, toObjectKeys} from '@taufik-nurrohman/to';

const blocks = {
    blockquote: 1,
    div: 1,
    dl: 1,
    figure: 1,
    form: 1,
    h1: 1,
    h2: 1,
    h3: 1,
    h4: 1,
    h5: 1,
    h6: 1,
    hr: 1,
    ol: 1,
    p: 1,
    pre: 1,
    table: 1,
    ul: 1
};

const elements = {
    "": ["", 'text goes here…'],
    a: ['a', 'link text goes here…', {href: ""}],
    area: ['area', false],
    b: ['strong', 'text goes here…'],
    base: ['base', false, {href: ""}],
    blockquote: ['blockquote', ""],
    br: ['br', false],
    button: ['button', 'text goes here…', {name: "", type: 'submit'}],
    caption: ['caption', 'Caption goes here…'],
    code: ['code', 'code goes here…'],
    col: ['col', false],
    dd: ['dd', 'Data goes here…'],
    dl: ['dl', ""],
    dt: ['dt', 'Title goes here…'],
    em: ['em', 'text goes here…'],
    figcaption: ['figcaption', 'Caption goes here…'],
    figure: ['figure', ""],
    h1: ['h1', 'Title goes here…'],
    h2: ['h2', 'Title goes here…'],
    h3: ['h3', 'Title goes here…'],
    h4: ['h4', 'Title goes here…'],
    h5: ['h5', 'Title goes here…'],
    h6: ['h6', 'Title goes here…'],
    hr: ['hr', false],
    i: ['em', 'text goes here…'],
    img: ['img', false, {alt: "", src: ""}],
    input: ['input', false, {name: "", type: 'text'}],
    li: ['li', 'List item goes here…'],
    link: ['link', false, {href: ""}],
    meta: ['meta', false],
    ol: ['ol', ""],
    option: ['option', 'Option goes here…'],
    p: ['p', 'Paragraph goes here…'],
    param: ['param', false, {name: ""}],
    pre: ['pre', 'text goes here…'],
    q: ['q', 'quote goes here…'],
    script: ['script', 'Code goes here…'],
    select: ['select', "", {name: ""}],
    source: ['source', false, {src: ""}],
    strong: ['strong', 'text goes here…'],
    style: ['style', 'Code goes here…'],
    tbody: ['tbody', ""],
    td: ['td', 'Data goes here…'],
    textarea: ['textarea', 'value goes here…', {name: ""}],
    tfoot: ['tfoot', ""],
    th: ['th', 'Title goes here…'],
    thead: ['thead', ""],
    tr: ['tr', ""],
    track: ['track', false],
    u: ['u', 'text goes here…'],
    ul: ['ul', ""],
    wbr: ['wbr', false]
};

let tagComment = () => '<!--([\\s\\S](?!-->)*)-->',
    tagData = () => '<!((?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^>\'"])*)>',
    tagDeclaration = () => '<\\?((?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^>\'"])*)\\?>',
    tagEnd = name => '</(' + name + ')>',
    tagName = () => '[\\w:.-]+',
    tagStart = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?>',
    tagVoid = name => '<(' + name + ')(\\s(?:\'(?:\\\\.|[^\'])*\'|"(?:\\\\.|[^"])*"|[^/>\'"])*)?/?>',
    tagTokens = () => '(?:' + tagComment() + '|' + tagData() + '|' + tagEnd(tagName()) + '|' + tagDeclaration() + '|' + tagVoid(tagName()) + '|' + tagStart(tagName()) + ')';

function isBlock(before, value, after) {
    return (!value || hasValue('\n', value)) && (!after || '\n' === after[0]) && (!before || '\n' === before.slice(-1));
}

function onKeyDown(e) {
    let $ = this, m,
        key = $.k(false).pop(),
        keys = $.k();
    if (e.defaultPrevented || $.keys[keys]) {
        return;
    }
    let {after, before, end, start, value} = $.$(),
        charIndent = $.state.source?.tab || $.state.tab || '\t',
        elements = $.state.elements || {},
        lineMatch = /^(\s+)/.exec(before.split('\n').pop()),
        lineMatchIndent = lineMatch && lineMatch[1] || "";
    if (isInteger(charIndent)) {
        charIndent = ' '.repeat(charIndent);
    }
    if ('Control-Shift-Enter' === keys) {
        offEventDefault(e);
        return $.insertBlock("", -1).toggleElementBlock(['p']);
    }
    if ('Control-Enter' === keys) {
        offEventDefault(e);
        return $.insertBlock("", 1).toggleElementBlock(['p']);
    }
    if ('Enter' === keys) {
        if (m = toPattern('^' + tagEnd('h[1-6]|p')).exec(after)) {
            offEventDefault(e);
            if (!value && toPattern(tagStart(m[1]) + '$', "").test(before) || (value && elements[m[1]] && value === elements[m[1]][1])) {
                return $.insert("").wrap('\n' + lineMatchIndent + charIndent, '\n' + lineMatchIndent).record();
            }
            return $.select(end + toCount(m[0])).insert('\n' + lineMatchIndent, -1).toggleElementBlock(['p']).record();
        }
        if (m = toPattern('^' + tagEnd('dt')).exec(after)) {
            offEventDefault(e);
            if (!value && toPattern(tagStart(m[1]) + '$', "").test(before) || (value && elements[m[1]] && value === elements[m[1]][1])) {
                return $.insert("").wrap('\n' + lineMatchIndent + charIndent, '\n' + lineMatchIndent).record();
            }
            return $.select(end + toCount(m[0])).insert('\n' + lineMatchIndent, -1).toggleElementBlock(['dd']).record();
        }
        if (m = toPattern('^' + tagEnd('dd|li')).exec(after)) {
            offEventDefault(e);
            if (!value && toPattern(tagStart(m[1]) + '$', "").test(before) || (value && elements[m[1]] && value === elements[m[1]][1])) {
                return $.insert("").wrap('\n' + lineMatchIndent + charIndent, '\n' + lineMatchIndent).record();
            }
            return $.select(end + toCount(m[0])).insert('\n' + lineMatchIndent, -1).toggleElementBlock([m[1]]).record();
        }
        return;
    }
}

function attach() {
    let $ = this, m;
    $.state = fromStates({
        elements
    }, $.state);
    $.insertElementBlock = (value, mode, clear) => {
        if (!isSet(mode)) {
            mode = -1;
        }
        if (!isSet(clear)) {
            clear = true;
        }
        let {after, before, end, start} = $.$(),
            afterCount = toCount(after.split('\n').shift()),
            beforeCount = toCount(before.split('\n').pop());
        if (1 === mode) {
            return $.select(end + afterCount).insertElement(value, mode).insert('\n', 1);
        }
        if (-1 === mode) {
            return $.select(start - beforeCount).insertElement(value, mode).insert('\n', -1);
        }
        return $.select(start - beforeCount, end + afterCount).trim('\n', '\n').insertElement(value, mode, clear);
    };
    $.insertImage = (hint, value, then) => {
        return $.prompt(hint ?? 'URL:', value ?? (theLocation.protocol + '//'), value => {
            if (!value) {
                return $;
            }
            let alt = $.$().value,
                element = $.state.elements.img ?? [];
            element[0] = element[0] ?? 'img';
            element[1] = element[1] ?? "";
            element[2] = fromStates({}, element[2] || {});
            element[2].alt = alt || (element[2].alt ?? "");
            element[2].src = value;
            $.record().insertElement(element).record();
            isFunction(then) && then.call($, value);
        });
    };
    $.insertLink = (hint, value, then) => {
        return $.prompt(hint ?? 'URL:', value ?? (theLocation.protocol + '//'), value => {
            if (!value) {
                return $;
            }
            let element = $.state.elements.a ?? [];
            element[0] = element[0] ?? 'a';
            element[1] = element[1] ?? "";
            element[2] = fromStates({}, element[2] || {});
            element[2].href = value;
            $.record().wrapElement(element).record();
            isFunction(then) && then.call($, value);
        });
    };
    $.peelElementBlock = (open, close, wrap) => {
        return $.peelElement(open, close, wrap).trim("", "", false, false);
    };
    $.toggleElementBlock = (open, close, wrap) => {
        let {after, before, value} = $.$();
        if (isString(open) && (m = toPattern('^' + tagStart(tagName()) + '$', "").exec(open))) {
            open = [m[1]];
        }
        if (wrap) {
            return $[(toPattern('^' + tagStart(open[0]) + '[\\s\\S]*?' + tagEnd(open[0]) + '$', "").test(value) ? 'peel' : 'wrap') + 'ElementBlock'](open, close, wrap);
        }
        return $[(toPattern('^' + tagEnd(open[0]), "").test(after) && toPattern(tagStart(open[0]) + '$', "").test(before) ? 'peel' : 'wrap') + 'ElementBlock'](open, close, wrap);
    };
    $.wrapElementBlock = (open, close, wrap) => {
        let {after, before, value} = $.$(),
            charIndent = $.state.source?.tab || $.state.tab || '\t',
            lineMatch = /^(\s+)/.exec(before.split('\n').pop()),
            lineMatchIndent = lineMatch && lineMatch[1] || "",
            tagStartMatch = toPattern(tagStart(tagName()) + '$', "").exec(before.trim());
        if (isInteger(charIndent)) {
            charIndent = ' '.repeat(charIndent);
        }
        if (tagStartMatch && after.trim().startsWith('</' + tagStartMatch[1] + '>')) {
            $.trim("", "", false, false); // Collapse the tag, then get the correct indentation of it
            lineMatch = /^(\s+)/.exec($.$().before.split('\n').pop());
            lineMatchIndent = lineMatch && lineMatch[1] || "";
            $.wrap('\n' + lineMatchIndent + charIndent, '\n' + lineMatchIndent);
        }
        return $.wrapElement(open, close, wrap);
    };
    return $.on('key.down', onKeyDown);
}

function detach() {
    return this.off('key.down', onKeyDown);
}

export default {attach, detach};