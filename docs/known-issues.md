# Known issues

Tests or visual/behavioural checks that were skipped, stubbed, or couldn't be mechanically verified, with what *is* verified instead.

- **Cursor-flee feel (Phase 2).** The flee is in `shaders/swim.glsl`-based vertex shaders and renders without errors, but "small fish scatter, large ones ignore it" is a motion judgment that headless screenshots can't confirm. Needs a human to sweep the pointer across a shoal at ~300m.
- **Frame rate.** 60–62fps is measured with Playwright driving the installed Chrome on the build machine (Apple GPU). Not measured on a mid-range Windows laptop.
