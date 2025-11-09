export default class AttendanceExportContext {
  constructor(strategy = null) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  export(data, options = {}) {
    if (!this.strategy) {
      throw new Error('Export strategy is not set');
    }
    return this.strategy.export(data, options);
  }
}
