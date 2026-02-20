// ===== ReadFlow — Export Module =====

function exportPDF() {
    if (!RF.state.currentText) {
        RF.showToast('Carregue um texto primeiro', 'warning');
        return;
    }

    var s = RF.state.settings;
    var printWindow = window.open('', '_blank');
    var paragraphs = RF.state.currentText.split(/\n+/).filter(function (p) { return p.trim(); });
    var html = paragraphs.map(function (p) { return '<p>' + RF.escapeHtml(p.trim()) + '</p>'; }).join('');

    printWindow.document.write(
        '<!DOCTYPE html>' +
        '<html lang="pt-BR">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>ReadFlow — Exportar</title>' +
        '<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Lora:wght@400;600&family=Source+Serif+4:wght@400;600&family=Crimson+Text:wght@400;600&display=swap" rel="stylesheet">' +
        '<style>' +
        '@page { margin: 2.5cm; }' +
        'body { font-family: ' + s.font + '; font-size: ' + s.fontSize + 'px; color: ' + s.textColor + '; background: ' + s.bgColor + '; line-height: ' + s.lineHeight + '; letter-spacing: ' + s.letterSpacing + 'em; word-spacing: ' + s.wordSpacing + 'em; max-width: 100%; text-align: ' + s.align + '; hyphens: auto; -webkit-hyphens: auto; }' +
        'p { margin-bottom: 1.2em; text-indent: 1.5em; }' +
        'p:first-child { text-indent: 0; }' +
        'p:first-child::first-letter { font-size: 3em; float: left; line-height: 0.85; margin-right: 8px; margin-top: 4px; color: #6C5CE7; font-weight: 700; }' +
        '.header-pdf { border-bottom: 2px solid #6C5CE7; padding-bottom: 10px; margin-bottom: 28px; color: #6C5CE7; font-family: sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="header-pdf">ReadFlow — Exportado em ' + new Date().toLocaleDateString('pt-BR') + '</div>' +
        html +
        '<script>window.onload = function(){ window.print(); window.close(); }<\/script>' +
        '</body>' +
        '</html>'
    );
    printWindow.document.close();
    RF.showToast('Preparando PDF...', 'picture_as_pdf');
}

RF.setupExport = function () {
    document.getElementById('exportPdfBtn').addEventListener('click', exportPDF);
};
