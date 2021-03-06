import RoleService from "../Role/RoleService";

const _isCourseModeValid = mode =>
    Object.values(_MODES).some(it => it.value === mode);

const _MODES = {
    ALL: {
        value: 'MODE_ALL',
        label: 'Все курсы',
    },
    MY: {
        value: 'MODE_MY',
        label: 'Мои курсы',
    },
}

export default {
    modes: {
        all: () =>
            _MODES.ALL.value,
        my: () =>
            _MODES.MY.value,
    },

    sortCoursesByDate(courses) {
        return [...courses].sort((a, b) => (a.startDate > b.startDate) ? 1 : -1)
    },

    getLabelForMode: mode => {
        if (_isCourseModeValid(mode)) {
            return Object.values(_MODES)
                .find(it => it.value === mode).label;
        } else {
            console.error('Unknown mode:', mode);
            return null;
        }
    },

    isModeValid: _isCourseModeValid,

    isActiveMode: (activeMode, currentMode) => activeMode === currentMode,

    isShowToggle: (userRole) => [RoleService.student(), RoleService.mentor()].includes(userRole)

};