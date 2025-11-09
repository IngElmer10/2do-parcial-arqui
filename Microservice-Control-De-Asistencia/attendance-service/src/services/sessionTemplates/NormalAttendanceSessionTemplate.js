const BaseAttendanceSessionTemplate = require('./BaseAttendanceSessionTemplate');

class NormalAttendanceSessionTemplate extends BaseAttendanceSessionTemplate {
    appendResponseMetadata(response) {
        return {
            ...response,
            session_type: 'normal'
        };
    }

    async applySpecificValidations(data, group) {
        this.ensureNormalDefaults(data, group);
    }

    async afterRecordsCreated(sessionId, data, enrolledStudents = []) {
        return this.buildPreparationSummary(sessionId, enrolledStudents.length);
    }

    ensureNormalDefaults(data, group) {
        if (!data.session_type || data.session_type !== 'normal') {
            data.session_type = 'normal';
        }

        const defaultStart = group && group.default_start_time ? group.default_start_time : null;
        const defaultEnd = group && group.default_end_time ? group.default_end_time : null;

        if (data.start_time === undefined) {
            data.start_time = defaultStart;
        }

        if (data.end_time === undefined) {
            data.end_time = defaultEnd;
        }
    }

    buildPreparationSummary(sessionId, totalStudents) {
        return {
            session_id: sessionId,
            total_students: totalStudents,
            notes: totalStudents === 0
                ? 'Sesión creada sin estudiantes asignados'
                : `Registros iniciales preparados para ${totalStudents} estudiantes`
        };
    }
}

module.exports = NormalAttendanceSessionTemplate;
