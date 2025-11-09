const BaseAttendanceSessionTemplate = require('./BaseAttendanceSessionTemplate');
const DateUtils = require('../../utils/dateUtils');

class ExamAttendanceSessionTemplate extends BaseAttendanceSessionTemplate {
    async applySpecificValidations(data) {
        if (!data.start_time || !data.end_time) {
            throw new Error('Exam sessions require both start_time and end_time');
        }

        const duration = DateUtils.differenceInMinutes(data.start_time, data.end_time);

        if (duration < 30) {
            throw new Error('Exam sessions must last at least 30 minutes');
        }

        data.exam_title = data.exam_title || 'Evaluación parcial';
        data.exam_duration_minutes = duration;
        data.exam_is_strict = true;
    }

    appendResponseMetadata(response, data) {
        const duration = response.exam_duration_minutes ?? data.exam_duration_minutes;
        return {
            ...response,
            session_type: response.session_type || 'exam',
            exam_metadata: {
                title: response.exam_title || data.exam_title,
                strict_attendance: response.exam_is_strict ?? true,
                duration_minutes: duration
            }
        };
    }
}

module.exports = ExamAttendanceSessionTemplate;
