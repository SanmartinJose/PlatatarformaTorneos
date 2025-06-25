import html2pdf from 'html2pdf.js';

export function exportarLlavesPDF() {
  const element = document.getElementById('brackets');
  html2pdf().from(element).save('llaves_torneo.pdf');
}
