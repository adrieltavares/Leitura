// ===== ReadFlow — File Handler Module =====

RF.setupDropZone = function () {
    var dropZone = document.getElementById('dropZone');
    var fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', function () { fileInput.click(); });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        var file = e.dataTransfer.files[0];
        if (file) _handleFile(file);
    });

    fileInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (file) _handleFile(file);
    });

    document.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.addEventListener('drop', function (e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        if (file && (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.pdf'))) {
            _handleFile(file);
        }
    });
};

function _handleFile(file) {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        var reader = new FileReader();
        reader.onload = function (e) {
            RF.els.textInput.value = e.target.result;
            RF.updateCharCount();
            RF.showToast('Arquivo "' + file.name + '" importado', 'upload_file');
        };
        reader.readAsText(file, 'UTF-8');
    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        _handlePDF(file);
    } else {
        RF.showToast('Formato não suportado. Use .txt ou .pdf.', 'warning');
    }
}

function _handlePDF(file) {
    if (typeof pdfjsLib === 'undefined') {
        RF.showToast('Biblioteca PDF não carregada. Verifique sua conexão com a internet.', 'warning');
        return;
    }

    RF.showToast('Processando PDF...', 'hourglass_empty');

    var reader = new FileReader();
    reader.onload = function (e) {
        var typedArray = new Uint8Array(e.target.result);

        pdfjsLib.getDocument({ data: typedArray }).promise.then(function (pdf) {
            var totalPages = pdf.numPages;
            var textParts = [];
            var pagesProcessed = 0;

            function processPage(pageNum) {
                pdf.getPage(pageNum).then(function (page) {
                    page.getTextContent().then(function (textContent) {
                        var pageText = '';
                        var lastY = null;

                        textContent.items.forEach(function (item) {
                            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
                                pageText += '\n';
                            }
                            pageText += item.str;
                            lastY = item.transform[5];
                        });

                        textParts[pageNum - 1] = pageText;
                        pagesProcessed++;

                        if (pagesProcessed === totalPages) {
                            var fullText = textParts.join('\n\n');
                            RF.els.textInput.value = fullText;
                            RF.updateCharCount();
                            RF.showToast('PDF "' + file.name + '" importado (' + totalPages + ' páginas)', 'picture_as_pdf');
                        }
                    });
                });
            }

            for (var i = 1; i <= totalPages; i++) {
                processPage(i);
            }
        }).catch(function (err) {
            console.error('Erro ao ler PDF:', err);
            RF.showToast('Erro ao processar o PDF. Verifique se o arquivo não está protegido.', 'error');
        });
    };
    reader.readAsArrayBuffer(file);
}
