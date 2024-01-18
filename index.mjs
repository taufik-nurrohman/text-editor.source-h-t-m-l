import {W, theLocation} from '@taufik-nurrohman/document';
import {esc, toPattern} from '@taufik-nurrohman/pattern';
import {fromHTML, fromStates, fromValue} from '@taufik-nurrohman/from';
import {hasValue} from '@taufik-nurrohman/has';
import {isArray, isFunction, isSet, isString} from '@taufik-nurrohman/is';
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
    blockquote: ['blockquote', 'quote goes here…'],
    br: ['br', false],
    button: ['button', 'text goes here…', {name: "", type: 'submit'}],
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
    img: ['img', false, {alt: "", src: ""}],
    input: ['input', false, {name: "", type: 'text'}],
    li: ['li', 'list item goes here…'],
    link: ['link', false, {href: ""}],
    meta: ['meta', false],
    ol: ['ol', ""],
    option: ['option', 'option goes here…'],
    p: ['p', 'paragraph goes here…'],
    param: ['param', false, {name: ""}],
    pre: ['pre', 'text goes here…'],
    q: ['q', 'quote goes here…'],
    script: ['script', 'code goes here…'],
    select: ['select', "", {name: ""}],
    source: ['source', false, {src: ""}],
    strong: ['strong', 'text goes here…'],
    style: ['style', 'code goes here…'],
    tbody: ['tbody', ""],
    td: ['td', 'data goes here…'],
    textarea: ['textarea', 'value goes here…', {name: ""}],
    tfoot: ['tfoot', ""],
    th: ['th', 'title goes here…'],
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
    let {after, before, end, start, value} = $.$();
    if ('Enter' === keys) {
        if (m = toPattern('^' + tagEnd('h[1-6]|p')).exec(after)) {
            offEventDefault(e);
            $.select(end + toCount(m[0])).toggleElementBlock(['p']);
            return;
        }
        console.log(m);
        return;
    }
}

function attach() {
    let $ = this, m;
    $.state = fromStates({
        elements
    }, $.state);
    $.insertElementBlock = (open, close, wrap) => {

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

    };
    $.toggleElementBlock = (open, close, wrap) => {
        if (isString(open) && (m = toPattern('^' + tagStart(tagName()) + '$', "").exec(open))) {
            open = [m[1]];
        }
        let {after, before, value} = $.$();
        if (
            !wrap && (!toPattern(tagStart(open[0]) + '$', "").test(before) && !toPattern('^' + tagEnd(open[0]), "").test(after)) ||
            wrap && (!toPattern('^' + tagStart(open[0]) + '[\\s\\S]*?' + tagEnd(open[0]) + '$', "").test(value))
        ) {
            $.trim('\n', '\n');
        }
        return $.toggleElement(open, close, wrap);
    };
    $.wrapElementBlock = (open, close, wrap) => {

    };
    return $.on('key.down', onKeyDown);
}

function detach() {
    return this.off('key.down', onKeyDown);
}

export default {attach, detach};