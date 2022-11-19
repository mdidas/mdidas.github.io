class FileDropArea {

    eventHandlers = {};

    constructor(id) {
      this.id = id;

      this.rootElement = document.getElementById(this.id);
      this.rootElement.addEventListener('drop', this.drop);
      this.rootElement.addEventListener('dragover', this.dragOver);
      this.rootElement.addEventListener('dragleave', this.dragLeave);

      document.addEventListener('dragover', (e) => e.preventDefault() );
    }

    drop = (e) => {
      e.preventDefault();
      this.rootElement.classList.remove('drop-area-drag-over');
      this.rootElement.classList.add('drop-area-dropped');
      
      let file = null;

      if (e.dataTransfer.items) {
        const item = e.dataTransfer.items[0];
          if (item.kind === 'file') {
            file = item.getAsFile();
          }
      } else {
        file = e.dataTransfer.files[0];
      }

      if (file !== null) {
        const date = file.lastModifiedDate.toString().replace(/\(.*\)/, '');
        this.rootElement.innerHTML = `${file.name}<br><br>${date}`;
        this.eventHandlers['fileDropped'](e, file);
      }
    }

    dragOver = (e) => this.rootElement.classList.add('drop-area-drag-over');

    dragLeave = (e) => this.rootElement.classList.remove('drop-area-drag-over');

    on = (eventName, eventHandler) => this.eventHandlers[eventName] = eventHandler;

  }
