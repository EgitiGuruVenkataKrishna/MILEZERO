# Design and tool skill references used for MILEZERO

The task's five named items were checked against published sources. This runtime's installed skill directory did not contain these skills, and outbound package installation/download from the container was unavailable. The local copies were therefore **not installed**; the published guidance was consulted where available. This file records the references and how they informed the build rather than claiming installed skills were executed.

## 1. Taste Skill

Reference: https://github.com/tasteskill/tasteskill (also known as the Taste Skill project)

Applied ideas: commit to an identifiable art direction; avoid boilerplate layouts; make typographic hierarchy, rhythm, and spatial composition deliberate; treat motion as feedback rather than decoration. MILEZERO uses a cream/ink/acid-lime/orange palette, typographic headline, geometric route illustration and a compact step-by-step input card.

## 2. Impeccable

Reference: https://github.com/pbakaus/impeccable

Applied ideas: clear information hierarchy, intentional typography and density, useful error states, responsive adaptation, accessibility-minded controls, and reduced-motion support. The interface avoids generic purple-gradient aesthetics and uses progressive disclosure, clear progress, plain-language question helpers, and explicit failure states.

## 3. Playwright CLI

Reference: https://github.com/microsoft/playwright-cli and https://playwright.dev/agent-cli/installation

The CLI/skill was not present locally and could not be installed from this runtime. A Python Playwright browser harness was available, so the onboarding branch, student path, sample-roadmap rendering, downloadable HTML, and the downloaded file's interactive checklist were exercised in Chromium. This is not a Playwright CLI skill run or a complete cross-browser suite; run Playwright CLI or Playwright Test in the project's normal development environment for fuller automated coverage.

## 4. Awesome design

There is no single uniquely identified skill named just “Awesome design” in the installed directory. A relevant curated directory was found: https://github.com/frankxai/awesome-design-agent-skills and https://github.com/zhuyansen/awesome-claude-design-skills. These are discovery/curation resources rather than one runtime skill. The project used the selection principle: use a small number of complementary design references instead of bulk-installing many overlapping skills.

## 5. image2threejs

Reference: https://github.com/lijiejoy/dsh-skill-image2threejs

This workflow converts a supplied 2D image into an interactive Three.js scene. No source image was supplied for this product, so forcing image2threejs into the hero would have added an irrelevant asset dependency. The hero instead uses a lightweight, responsive CSS orbital illustration. When there is an actual brand image/illustration to convert, the image2threejs workflow may be useful as a separate visual component.
