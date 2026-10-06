export interface NavItem {
    label: string;
    path: string;
    anyOf: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { 
        label: 'Home',
        path: '/',
        anyOf: ['SHIFT_READ']
    },
    {
        label: 'Schedules',
        path: '/schedules',
        anyOf: ['SHIFT_WRITE']
    },
    {
        label: 'Team',
        path: '/team',
        anyOf: ['EMPLOYEE_READ_ANY']
    },
    {
        label: 'Requests',
        path: '/requests',
        anyOf: ['TIME_OFF_SELF', 'TIME_OFF_ANY', 'TIME_OFF_REVIEW', 'AVAILABILITY_SELF', 'AVAILABILITY_ANY']
    },
    {
        label: 'Stores',
        path: '/stores',
        anyOf: ['STORE_READ']
    },
    {
        label: 'Roles',
        path: '/roles',
        anyOf: ['ROLE_MANAGE']
    }
]