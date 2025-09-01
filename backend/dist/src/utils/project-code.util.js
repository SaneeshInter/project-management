"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProjectCode = generateProjectCode;
exports.getDepartmentCode = getDepartmentCode;
exports.getAllDepartmentCodes = getAllDepartmentCodes;
const client_1 = require("@prisma/client");
const DEPARTMENT_CODES = {
    [client_1.Department.PMO]: 'P',
    [client_1.Department.DESIGN]: 'D',
    [client_1.Department.HTML]: 'H',
    [client_1.Department.PHP]: 'F',
    [client_1.Department.REACT]: 'R',
    [client_1.Department.WORDPRESS]: 'W',
    [client_1.Department.QA]: 'Q',
    [client_1.Department.DELIVERY]: 'L',
    [client_1.Department.MANAGER]: 'M',
};
function generateProjectCode(departmentHistory) {
    if (!departmentHistory || departmentHistory.length === 0) {
        return '';
    }
    const sortedHistory = departmentHistory
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const completedDepartmentCodes = sortedHistory
        .filter(history => history.workStatus === client_1.DepartmentWorkStatus.COMPLETED)
        .map(history => DEPARTMENT_CODES[history.toDepartment])
        .filter(code => code);
    return completedDepartmentCodes.join('');
}
function getDepartmentCode(department) {
    return DEPARTMENT_CODES[department] || '';
}
function getAllDepartmentCodes() {
    const codes = {};
    Object.entries(DEPARTMENT_CODES).forEach(([dept, code]) => {
        codes[dept] = code;
    });
    return codes;
}
//# sourceMappingURL=project-code.util.js.map