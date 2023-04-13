
function validate(string) {
    const htmlString = new HtmlString(string);
    const errors = htmlString.getValidationErrors('openingFirst');

    const errorsEl = document.getElementById('errors');
    errorsEl.innerHTML = '';

    const validationArray = [];

    errors.forEach(function(tag, index, all) {
        errorsEl.innerHTML += tag.getValidationMessage();
    
        if (index === 0 && all.length > 1) {
            errorsEl.innerHTML += '\n\n----------------------------\n\n';
        }
    });
}

const htmlInput = document.getElementById('html');
htmlInput.addEventListener('keyup', () => { validate(htmlInput.value) });