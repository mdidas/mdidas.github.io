window.onload = async function() {

    const view = {

        $el: {
            html: document.querySelector('html'),
            scrollUpButton: document.querySelector('.scroll-up'),
            paperToggle: document.querySelector('.paper-toggle')
        },

        typeText: async () => {
            const targetElement = document.querySelector('.typed-text');
            const sourceElement = document.querySelector('.text-to-type');

            const typeWriter = new TypeWriter(targetElement);
            await typeWriter.typeTextFrom(sourceElement);
        },

        scrollHandler: () => {
            const viewportHeight = window.innerHeight;
            view.$el.scrollUpButton.classList.toggle('hidden', view.$el.html.scrollTop <= 0.6 * viewportHeight);
        },

        togglePaperButton: () => {
            const children = view.$el.paperToggle.children;
            for (let i = 0; i < children.length; i++) {
                children[i].classList.toggle('hidden');
            }
        },

        initialize: () => {
            document.addEventListener('scroll', view.scrollHandler);
            document.addEventListener('resize', view.scrollHandler);
            view.$el.paperToggle.addEventListener('click', view.togglePaperButton);
            view.typeText();
        }
    }

    view.initialize();
};
