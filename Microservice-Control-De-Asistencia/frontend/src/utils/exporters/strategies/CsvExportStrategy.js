import AttendanceExportStrategy from '../AttendanceExportStrategy';

export default class CsvExportStrategy extends AttendanceExportStrategy {
  export({ session, records }, options = {}) {
    if (!session || !Array.isArray(records)) {
      throw new Error('Invalid data to export CSV');
    }

    const headers = [
      'Estudiante',
      'ID Estudiante',
      'Estado',
      'Fecha de Sesión',
      'Grupo',
      'Materia',
    ];

    const rows = records.map((record) => [
      record.student_name,
      record.student_id,
      record.status === 'present' ? 'Presente' : 'Ausente',
      session.session_date,
      session.group_code,
      session.subject_name,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value ?? ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = options.filename || this.buildFilename(session, 'csv');
    this.triggerDownload(blob, filename);
  }

  triggerDownload(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  buildFilename(session, extension) {
    const base = `asistencia_${session.group_code}_${session.session_date}`;
    return `${base}.${extension}`;
  }
}
