# Cohort date display

The cohort date is currently disabled. Its former July 6 date, visible labels, and countdown JavaScript were removed from `index.html` so the site does not advertise an undecided start date.

When a new date is decided, restore the feature at the two `COHORT DATE UI` comments in `index.html`:

1. Add the dated badge near the top of the hero.
2. Add the hero countdown as a second `.hero-meta-item` after the Founders Discount.
3. Add the full countdown and dated label in the final call-to-action.
4. Add one countdown script near the existing FAQ script. Use one explicit target date and time, then update both sets of countdown elements from it.

The reusable styling remains in `index.html` under `.hero-badge`, `/* Hero countdown */`, and `/* Countdown */`. The previous countdown used `hd`, `hh`, and `hm` for the hero values and `fd`, `fh`, `fm`, and `fs` for the final call-to-action values.

Use an explicit year for the new date. The old implementation rolled July 6 into the next calendar year after the date passed, which could unintentionally advertise an unconfirmed cohort.
