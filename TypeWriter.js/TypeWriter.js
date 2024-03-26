class TypeWriter {
    constructor(element) {
        this.element = element;
        this.delay = 50;
    }

    _stripTags(text) {
        text = text.replace(/<br>|<br\/>|<br \/>/g, '');
        text = text.replace(/ +/g, ' ').trim();

        const converterElement = document.createElement('div');
        converterElement.innerHTML = text;
        text = converterElement.textContent || converterElement.innerText || '';
        converterElement.remove();

        return text;
    }

    _format(text, len) {
        text = text.substring(0, len);
        return text.replaceAll('\n', '<br>');
    }

    type(text) {
        for(let i= 0; i <= text.length; i++) {
            setTimeout(() => this.element.innerHTML = this._format(text, i), i * this.delay);
        }
        return new Promise((res) => setTimeout(res, text.length * this.delay));
    }

    async typeTextFrom(sourceElement) {
        const text = this._stripTags(sourceElement.innerHTML);
        await this.type(text);
        this.element.innerHTML = sourceElement.innerHTML.trim();
    }

    typeReverse(text) {
        for(let i=text.length; i>=0; i--) {
            setTimeout(() => this.element.innerHTML = this._format(text, i), (text.length - i)*this.delay);
        }
        return new Promise((res) => setTimeout(res, text.length * this.delay));
    }

    typeAndErase(text) {
        this.type(text);
        setTimeout((() => this.typeReverse(text)), text.length * this.delay);
        return new Promise((res) => setTimeout(res, 2 * text.length * this.delay));
    }

    pause(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }

    async typeAndEraseArray(words, msInBetween) {
        msInBetween = msInBetween ?? 500;
        for(let i=0; i < words.length; i++) {
            await this.typeAndErase(words[i]);
            await this.pause(msInBetween);
        }
    }
}