import AttendanceExportStrategy from '../AttendanceExportStrategy';
import * as XLSX from 'xlsx';

export default class ExcelExportStrategy extends AttendanceExportStrategy {
  export({ session, records }, options = {}) {
    if (!session || !Array.isArray(records)) {
      throw new Error('Invalid data to export Excel');
    }

    const worksheetData = [
      ['Materia', session.subject_name],
      ['Grupo', session.group_code],
      ['Fecha', session.session_date],
      [],
      ['Estudiante', 'ID Estudiante', 'Estado', 'Hora de Registro'],
    ];

    records.forEach((record) => {
      worksheetData.push([
        record.student_name,
        record.student_id,
        record.status === 'present' ? 'Presente' : 'Ausente',
        record.recorded_at || '',
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencia');

    const filename = options.filename || this.buildFilename(session, 'xlsx');
    XLSX.writeFile(workbook, filename);
  }

  buildFilename(session, extension) {
    const base = `asistencia_${session.group_code}_${session.session_date}`;
    return `${base}.${extension}`;
  }
}
