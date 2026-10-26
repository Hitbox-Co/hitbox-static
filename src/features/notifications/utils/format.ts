/** Short relative age, the way a notification feed writes it: 4m, 3h, 2d, 5w. */
export function formatAge(createdAt: number, now: number = Date.now()): string {
    const minutes = Math.max(0, Math.round((now - createdAt) / 60_000));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.round(days / 7);
    if (weeks < 5) return `${weeks}w ago`;

    return new Date(createdAt).toLocaleDateString();
}
