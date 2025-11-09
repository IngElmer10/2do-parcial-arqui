class DateUtils {
    static getCurrentDate() {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    static formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    static isValidTime(timeString) {
        if (!timeString) return false;
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return regex.test(timeString);
    }

    static isToday(dateString) {
        return dateString === this.getCurrentDate();
    }

    static differenceInMinutes(startTime, endTime) {
        if (!this.isValidTime(startTime) || !this.isValidTime(endTime)) {
            throw new Error('Time format must be HH:MM');
        }

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    }
}

module.exports = DateUtils;