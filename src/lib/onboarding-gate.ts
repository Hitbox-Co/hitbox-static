/**
 * "Show onboarding after this sign-up" flag.
 *
 * Every sign-up path (Apple, Google, email popup, "Create your Account", phone)
 * ends in a Clerk session, but each navigates on its own — and an OAuth deep link
 * or a screen unmounting can overrule a `router.replace` made by the form. So the
 * sign-up screens only *arm* this flag, and `RootNavigator` (src/app/_layout.tsx)
 * sends the user to onboarding the moment the session actually goes active.
 *
 * Armed only from the sign-up screens, so the sign-in popup used by the gated
 * tabs and the claim flow (which must return the user to what they were doing)
 * is unaffected.
 */
let pending = false;

export const armOnboarding = () => {
    pending = true;
};

export const disarmOnboarding = () => {
    pending = false;
};

/** Reads and clears the flag. */
export const takeOnboarding = () => {
    const was = pending;
    pending = false;
    return was;
};
