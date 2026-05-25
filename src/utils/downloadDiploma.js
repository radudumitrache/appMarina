import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function downloadDiplomaAsPdf(certElement, filename = 'diploma.pdf') {
  const canvas = await html2canvas(certElement, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#faf9f6',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width / 3, canvas.height / 3],
  })

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3)
  pdf.save(filename)
}
