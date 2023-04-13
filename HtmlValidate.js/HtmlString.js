class HtmlString
{
    tags = [];
    tagIndexByPosition = {};
    string = '';

    constructor(string) {
        this.string = string;

        let rest = this.string;
        let position = 0;
        let tag = {};
        
        while(rest !== '' && tag !== null) {
            const openingMatches = rest.match(/\<([a-zA-Z]+) {0,1}[^\<\>\/]*?\>|\<([a-zA-Z]+)\>/);
            const standaloneMatches = rest.match(/\<([a-zA-Z]+) {0,1}[^\<\>]*? {0,1}\/\>/);
            const closingMatches = rest.match(/\<\/([a-zA-Z]+)\>/);
            const matches = [];

            let length = 0;
    
            if (openingMatches !== null) {
                let role ='opening';
                // if (openingMatches[1] === 'br' || openingMatches[1] === 'img' || openingMatches[1] === 'hr') {
                //     role = 'standalone';
                // }

                tag = new Tag(
                    openingMatches[1],
                    openingMatches[0],
                    role,
                    this,
                    position + openingMatches.index,
                    openingMatches.index + openingMatches[0].length,
                    rest
                );

                matches.push(tag);
            }

            if (standaloneMatches !== null) {
                tag = new Tag(
                    standaloneMatches[1],
                    standaloneMatches[0],
                    'standalone',
                    this,
                    position + standaloneMatches.index,
                    standaloneMatches.index + standaloneMatches[0].length,
                    rest
                );
    
                matches.push(tag);
            }

            if (closingMatches !== null) {
                tag = new Tag(
                    closingMatches[1],
                    closingMatches[0],
                    'closing',
                    this,
                    position + closingMatches.index,
                    closingMatches.index + closingMatches[0].length,
                    rest
                );
    
                matches.push(tag);
            }

            tag = null;
    
            let minIndex = 5;
            let minPosition = 200000;
    
            matches.forEach(function(item, index) {
                if (item.position < minPosition) {
                    minIndex = index;
                    minPosition = item.position;
                }
            });
    
            if (minIndex < 5) {
                tag = matches[minIndex];
            }
    
            if (tag !== null) {
                this.tags.push(tag);
                position += tag.length;
                rest = string.substring(position);
            }
        }

        let depth = 0;
        this.tags.forEach(function(tag) {
            if (tag.role === 'opening') {
                tag.setForwardDepth(depth);
                depth++;
            }
            else if (tag.role === 'closing') {
                depth--;
                tag.setForwardDepth(depth);
            }
            else if (tag.role === 'standalone') {
                tag.setForwardDepth(depth);
            }
        });

        this.tags.forEach(function (tag, index) {
            this.tagIndexByPosition[tag.position] = index;
        }.bind(this));

        depth = 0;
        this.tags.forEach(function(tag, index) {
            tag = this.tags[this.tags.length - 1 - index];

            if (tag.role === 'opening') {
                depth--;
                tag.setBackwardDepth(depth);
            }
            else if (tag.role === 'closing') {
                tag.setBackwardDepth(depth);
                depth++;
            }
            else if (tag.role === 'standalone') {
                tag.setBackwardDepth(depth);
            }
        }.bind(this));

        window.tags = this.tags;
    }

    getTags() {        
        return this.tags;
    }

    getValidationErrors(sort) {    
        let errors = [];

        this.tags.forEach(function(tag) {
            if (Tag.allowed.indexOf(tag.tagName) === -1) {
                tag.setValidationMessage(
                    '* Invalid tag found: ' + tag.getHtmlSnippet(true) +
                    '\n  -position: ' + tag.position + 
                    '\n  -line '+ tag.getLine() +
                    '\n  -snippet:\n '+tag.getSnippet(true).substring(0,40)
                );

                errors.push(tag);
            }
        });

        if (errors.length > 0) {
            return errors;
        }

        let maxDepth = -1;
        let tagErrorByForwardSearch = null;
    
        this.tags.forEach(function(tag, index) {
            if (tag.getMatchingTag() === null && tag.forwardDepth > maxDepth) {
                tag.setValidationMessage(
                    '* No matching tag found for ' + tag.getHtmlSnippet(true) +
                    '\n  -position: ' + tag.position + 
                    '\n  -line '+ tag.getLine() +
                    '\n  -snippet:\n '+tag.getSnippet(true).substring(0,40)
                );
                tagErrorByForwardSearch = tag;
                maxDepth = tag.forwardDepth;
            }
        });
    
        maxDepth = -1;
        let tagErrorByBackwardSearch = null;
    
        this.tags.forEach(function(tag, index) {
            tag = this.tags[this.tags.length - 1 - index];
    
            if (tag.getMatchingTag('backward') === null && tag.backwardDepth > maxDepth) {
                tag.setValidationMessage(
                    '* No matching tag found for ' + tag.getHtmlSnippet(true) +
                    '\n  -position: ' + tag.position + 
                    '\n  -line '+ tag.getLine() +
                    '\n  -snippet:\n '+tag.getSnippet(true).substring(0,40)
                );
                tagErrorByBackwardSearch = tag;
                maxDepth = tag.backwardDepth;
            }
        }.bind(this));

        if (tagErrorByForwardSearch !== null) {
            errors.push(tagErrorByForwardSearch);
        }

        if (
            tagErrorByBackwardSearch !== null &&
            (tagErrorByForwardSearch === null || (tagErrorByForwardSearch !== null && tagErrorByBackwardSearch.position !== tagErrorByForwardSearch.position))
        ) {
            errors.push(tagErrorByBackwardSearch);
        }

        if (errors.length === 2) {
            if (errors[0].hasCorrectNumberOfOccurrences()) {
                errors.splice(0,1);
            }
            else if (errors[1].hasCorrectNumberOfOccurrences()) {
                errors.splice(1,1);
            }
        }

        if (errors.length === 2) {

            if (sort === true && errors[0].position > errors[1].position) {
                errors = errors.reverse();
            }
            else if (sort === 'openingFirst' && errors[0].role === 'closing' && errors[1].role === 'opening') {
                errors = errors.reverse();
            }
        }

        if (errors.length === 0) {

            let error = null;
            this.tags.forEach(function(tag, index) {
                tag = this.tags[this.tags.length - 1 - index];
                const nestingError = tag.getNestingError();

                if (nestingError !== null) {
                    tag.setValidationMessage(
                        '*  '+ nestingError +': ' + tag.getHtmlSnippet(true) +
                        '\n  -position: ' + tag.position + 
                        '\n  -line '+ tag.getLine() +
                        '\n  -snippet:\n '+tag.getSnippet(true).substring(0,40)
                    );
                    error = tag;
                }
            }.bind(this));
    
            if (error !== null) {
                errors.push(error);
            }

        }

        return errors;
    }
}
