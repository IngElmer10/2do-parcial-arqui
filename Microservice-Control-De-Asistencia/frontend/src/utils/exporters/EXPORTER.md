

### Explicación del flujo:

1. **Inicialización**:
   - [SessionHistory](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/components/professor/SessionHistory.jsx:10:0-207:2) crea instancias de las estrategias ([PdfExportStrategy](cci:2://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/strategies/PdfExportStrategy.js:3:0-51:1), [CsvExportStrategy](cci:2://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/strategies/CsvExportStrategy.js:2:0-51:1), [ExcelExportStrategy](cci:2://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/strategies/ExcelExportStrategy.js:3:0-38:1)).
   - Crea un [AttendanceExportContext](cci:2://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/AttendanceExportContext.js:0:0-15:1) que usará alguna de estas estrategias.

2. **Solicitud de exportación**:
   - El usuario hace clic en un botón (PDF/CSV/Excel) en la interfaz.
   - [SessionHistory.handleExport(format)](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/components/professor/SessionHistory.jsx:91:2-109:4) recibe el formato solicitado.

3. **Configuración de estrategia**:
   - [handleExport](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/components/professor/SessionHistory.jsx:91:2-109:4) selecciona la estrategia según el formato.
   - Usa [exportContext.setStrategy(strategy)](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/AttendanceExportContext.js:5:2-7:3) para configurarla.

4. **Ejecución**:
   - [handleExport](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/components/professor/SessionHistory.jsx:91:2-109:4) llama a [exportContext.export(payload)](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/strategies/CsvExportStrategy.js:3:2-33:3).
   - El contexto delega la ejecución a la estrategia actual: [strategy.export(data, options)](cci:1://file:///c:/Users/JORGE%20N/Documents/ARQUITECTURA/Microservice-Control-De-Asistencia/frontend/src/utils/exporters/strategies/CsvExportStrategy.js:3:2-33:3).

5. **Generación de archivo**:
   - Cada estrategia implementa su lógica específica:
     - **PDF**: Usa `jsPDF` para generar un documento con formato.
     - **CSV**: Genera texto plano con formato CSV y lo descarga como blob.
     - **Excel**: Usa `xlsx` para crear una hoja de cálculo.

6. **Descarga**:
   - Cada estrategia maneja la descarga del archivo generado.

