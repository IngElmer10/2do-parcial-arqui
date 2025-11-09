import AttendanceExportStrategy from '../AttendanceExportStrategy';
import jsPDF from 'jspdf';

export default class PdfExportStrategy extends AttendanceExportStrategy {
  export({ session, records }, options = {}) {
    if (!session || !Array.isArray(records)) {
      throw new Error('Invalid data to export PDF');
    }

    const doc = new jsPDF();
    const margin = 14;
    let yOffset = margin;

    const title = options.title || `Lista de Asistencia - ${session.subject_name}`;
    doc.setFontSize(16);
    doc.text(title, margin, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.text(`Grupo: ${session.group_code}`, margin, yOffset);
    yOffset += 6;
    doc.text(`Fecha: ${session.session_date}`, margin, yOffset);
    yOffset += 10;

    doc.setFontSize(11);
    doc.text('Estudiante', margin, yOffset);
    doc.text('ID', margin + 70, yOffset);
    doc.text('Estado', margin + 110, yOffset);
    yOffset += 8;

    records.forEach((record) => {
      if (yOffset > 280) {
        doc.addPage();
        yOffset = margin;
      }

      doc.text(record.student_name || '-', margin, yOffset);
      doc.text(String(record.student_id || '-'), margin + 70, yOffset);
      const status = record.status === 'present' ? 'Presente' : 'Ausente';
      doc.text(status, margin + 110, yOffset);
      yOffset += 7;
    });

    const filename = options.filename || this.buildFilename(session, 'pdf');
    doc.save(filename);
  }

  buildFilename(session, extension) {
    const base = `asistencia_${session.group_code}_${session.session_date}`;
    return `${base}.${extension}`;
  }
}
