export default class AttendanceExportStrategy {
  export() {
    throw new Error('export() must be implemented by concrete strategy');
  }
}
