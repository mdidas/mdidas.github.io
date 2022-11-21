const renderedPdfs = [ null, null ];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const renderPdfDiff = function() {
    const canvasElements = [ renderedPdfs[0].getCanvasElements(), renderedPdfs[1].getCanvasElements() ];

    // remove empty pages from previous calls
    [0, 1].forEach(function(index) {
        for (let i = canvasElements[index].length - 1; i > 0; i--) {
            if (canvasElements[index][i].style.display === 'none') {
                canvasElements[index][i].remove();
                canvasElements[index].pop();
            }
        }
    });

    const diffSection = document.getElementById('diff');
    const pageCounts = [ canvasElements[0].length - 1, canvasElements[1].length - 1 ];
    const indexToFill = pageCounts[0] > pageCounts[1] ? 1 : 0;
    const pdfParentElementToFill = document.getElementById('pdf-'+ indexToFill);

    let diffPageCount = 0;

    // add empty pages (if pdf documents have different length) before diffing the canvases
    for(let p = Math.min(...pageCounts)+1; p <= Math.max(...pageCounts); p++) {
        const canvasWrapper = document.createElement('div');
        canvasWrapper.setAttribute('class', 'canvas-wrapper dummy-page');
        pdfParentElementToFill.appendChild(canvasWrapper);

        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = canvasElements[0][1].width;
        emptyCanvas.height = canvasElements[0][1].height;
        emptyCanvas.style.display = 'none';

        const ctx = emptyCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0, emptyCanvas.width, emptyCanvas.height);

        canvasWrapper.appendChild(emptyCanvas);
        canvasElements[indexToFill].push(emptyCanvas);
    }

    // render canvas diffs
    diffSection.innerHTML = '';

    for(let p=1; p <= Math.max(...pageCounts); p++) {
      const diff = new CanvasDiff(canvasElements[0][p], canvasElements[1][p]);
      const diffElement = diff.render(diffSection);

      const pageNumber = document.createElement('span');
      pageNumber.className = 'page-number';
      pageNumber.innerText = p;
      diffElement.appendChild(pageNumber);

      if (diff.getPercentage() === 0) {
        const canvas = diffElement.children[0];
        canvas.style.opacity = 0.2;

        const check = document.createElement('span');
        check.className = 'check';

        diffElement.appendChild(check);
      }
      else {
        diffPageCount++;
      }
    }

    // render diff message
    const diffInfo = document.getElementById('diff-info');

    const diffMessage = diffPageCount === 1
      ? 'There is 1 page with differences.'
      : 'There are ' + diffPageCount + ' pages with differences.';

    diffInfo.innerHTML = diffPageCount === 0
      ? '<span class="check"></span> The documents are identical.'
      : '<span class="diff-mark"></span> ' + diffMessage;
}

const renderPdfDocument = function(fileReader, index) {

  const pdf = new PdfRenderer(fileReader);
  const loader = document.getElementById('loader');
  loader.className = '';

  pdf.render('pdf-' + index).then(
    (renderedPdf) => { 
      renderedPdfs[index] = renderedPdf;
    
      if (renderedPdfs[0] !== null && renderedPdfs[1] !== null) {
        renderPdfDiff();
        loader.className = '-hidden';
        document.getElementById('diff-info').scrollIntoView();
      }

      loader.className = '-hidden';
    },
    () => console.log('error')
  );

}

const fileDropped = function(e, file) {

  const currentTarget = e.currentTarget;
  const index = currentTarget.id.replace('file-drop-area-', '');

  currentTarget.innerHTML = index == 0
    ? 'Original File<br><br>' + currentTarget.innerHTML
    : 'Modified File<br><br>' + currentTarget.innerHTML;

  if (file && file.name.endsWith('.pdf')) {
    fileReader = new FileReader();
    fileReader.onloadend = () => renderPdfDocument(fileReader, index);
    fileReader.readAsArrayBuffer(file);
  }
};

[ 'file-drop-area-0', 'file-drop-area-1' ].forEach(function(id, index) {
  const fileDropArea = new FileDropArea(id);
  fileDropArea.on('fileDropped', fileDropped);
}); 