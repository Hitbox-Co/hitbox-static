import React from 'react';

import { ClaimFailure } from '../api/claimErrors';
import { NoticeCard } from './TapCards';

/** The refusals the server names, so they are not shown as "check your connection". */
export const NAMED_REFUSALS: ClaimFailure[] = ['RATE_LIMITED', 'TAP_UNAVAILABLE', 'BAD_TAG'];

/** Shared by the claim and verify screens. Nothing was claimed in any of these. */
export default function TapRefusalNotice({ kind }: { kind: ClaimFailure }) {
    if (kind === 'RATE_LIMITED') {
        return (
            <NoticeCard
                tone="warn"
                title="Too many taps"
                body="You've tapped a lot in the last minute. Wait a moment, then hold your phone to the tag again. Nothing was claimed."
            />
        );
    }
    if (kind === 'TAP_UNAVAILABLE') {
        return (
            <NoticeCard
                tone="bad"
                title="Tag checks are unavailable"
                body="HitBox can't check tags right now. Please try again later. Nothing was claimed."
            />
        );
    }
    return (
        <NoticeCard
            tone="bad"
            title="This tag's link isn't supported"
            body="The link on this tag isn't in a form HitBox accepts. Contact support if it keeps happening. Nothing was claimed."
        />
    );
}
