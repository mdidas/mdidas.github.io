class Tag
{
    static allowed = [
        'a', 'abbr', /*'acronym'*/, 'address', 'applet', 'area',
        'article', 'aside', 'audio', 'b', 'base', 'basefont',
        'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br',
        'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col',
        'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn',
        'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
        'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup',
        'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', /*'isindex'*/, 'kbd',
        'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'marquee',
        'menu', 'menuitem', 'meta', 'meter', 'nav', 'nobr', 'noframes', 'noscript',
        'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'plaintext',
        'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script',
        'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style',
        'sub', 'spacer', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template',
        'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt',
        'u', 'ul', 'var', 'video', 'wbr', 'xmp',
    ];

    validationMessage = '';

    constructor(tagName, htmlSnippet, role, htmlString, position, length, snippet, forwardDepth, backwardDepth) {
        this.tagName = tagName;
        this.htmlSnippet = htmlSnippet;
        this.role = role;
        this.htmlString = htmlString;
        this.position = position;
        this.length = length;
        this.snippet = snippet;
        this.forwardDepth = forwardDepth;
        this.backwardDepth = backwardDepth;
    }

    setForwardDepth(depth) {
        this.forwardDepth = depth;
    }

    setBackwardDepth(depth) {
        this.backwardDepth = depth;
    }

    getLine() {
        let prefixString = this.htmlString.string.substring(0, this.position);
        return (prefixString.match(/\n/g) || []).length;
    }

    getIndex() {
        return this.htmlString.tagIndexByPosition[this.position];
    }

    setValidationMessage(msg) {
        return this.validationMessage = msg;
    }

    getValidationMessage() {
        return this.validationMessage;
    }

    getMatchingTag(mode) {
        if (mode === undefined) {
            mode = 'forward';
        }

        if (this.role === 'standalone') {
            return this;
        }

        let layer = 0;
        let tags = this.htmlString.getTags();

        if (this.role === 'opening') {
            for(let index = this.getIndex(); index < tags.length; index++) {
                
                let currentTag = tags[index];

                if (mode === 'backward') {
                    if (currentTag.backwardDepth === this.backwardDepth && currentTag.tagName === this.tagName && currentTag.role === 'closing') {
                        return currentTag;
                    }
                }
                else {
                    if (currentTag.forwardDepth === this.forwardDepth && currentTag.tagName === this.tagName && currentTag.role === 'closing') {
                        return currentTag;
                    }
                }
            }
        }

        if (this.role === 'closing') {
            for(let index = this.getIndex(); index >= 0; index--) {
                let currentTag = tags[index];

                if (this.mode === 'backward') {
                    if (currentTag.backwardDepth === this.backwardDepth && currentTag.tagName === this.tagName && currentTag.role === 'opening') {
                        return currentTag;
                    }
                }
                else {
                    if (currentTag.forwardDepth === this.forwardDepth && currentTag.tagName === this.tagName && currentTag.role === 'opening') {
                        return currentTag;
                    }
                }
            }
        }

        return null;
    }

    getParent() {
        let tags = this.htmlString.getTags();

        for(let index = this.getIndex(); index >= 0; index--) {
            let currentTag = tags[index];
            if (currentTag.forwardDepth === this.forwardDepth  - 1 && currentTag.role === 'opening') {
                return currentTag;
            }
        }

        return null;
    }

    static escapeHtmlString(string) {
        return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    getHtmlSnippet(escaped) {
        return escaped === true
            ? Tag.escapeHtmlString(this.htmlSnippet)
            : this.htmlSnippet;
    }

    getSnippet(escaped) {
        return escaped === true
            ? Tag.escapeHtmlString(this.snippet)
            : this.snippet;
    }

    hasCorrectNumberOfOccurrences() {
        if (this.role === 'standalone') {
            return true;
        }

        let layer = 0;
        this.htmlString.getTags().forEach(function(tag) {
            if (tag.tagName === this.tagName) {
                if (tag.role === 'opening') {
                    layer++;
                }
                else if (tag.role === 'closing') {
                    layer--;
                }
            }
        }.bind(this));

        return layer === 0;
    }

    getNestingError() {
        const parent = this.getParent();

        if (parent !== null && this.tagName === 'li' && this.role === 'opening') {
            if (parent.tagName !== 'ol' && parent.tagName !== 'ul') {
                return '&lt;li&gt; only allowed as direct child of &lt;ol&gt; or &lt;ul&gt;';
            }
        }

        return null;
    }
}