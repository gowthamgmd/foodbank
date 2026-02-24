import { toTitleCase } from '../utils/helpers';

export default function RoleBadge({ role }) {
    const map = {
        ADMIN: 'badge-blue',
        DONOR: 'badge-green',
        BENEFICIARY: 'badge-yellow',
    };
    return (
        <span className={map[role] ?? 'badge-gray'}>
            {toTitleCase(role)}
        </span>
    );
}
