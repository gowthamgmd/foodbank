import { daysUntilExpiry, isExpired } from '../utils/helpers';

export default function ExpiryBadge({ expiryDate }) {
    if (!expiryDate) return null;
    const days = daysUntilExpiry(expiryDate);

    if (isExpired(expiryDate)) {
        return <span className="badge badge-red">Expired</span>;
    }
    if (days <= 3) {
        return <span className="badge badge-yellow">Expires in {days}d</span>;
    }
    return <span className="badge badge-green">{days} days left</span>;
}
