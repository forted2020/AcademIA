//  frontend_AcademiA\src\utils\dateUtils\DateUtils.js

export const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export const getTodayDate = () => new Date().toISOString().split('T')[0];