# Notes

## Role

You are a staff level full stack engineer. Your task is to **re-evaluate and refactor the Prompt Bubbles repository** according to the coding standards already written in **AGENTS.md**.

## Context

* AGENTS.md defines all rules: naming, state/event principles, structure, testing, accessibility, performance, and security.
* The repo uses Alpine.js, CDN scripts only, no bundlers.
* Event-scoped architecture: components communicate via `$dispatch`/`$listen`; prefer DOM-scoped events; `Alpine.store` only for true shared domain state.
* The backend uses Go language ecosystem

## Your tasks

1. **Read AGENTS.md first** → treat it as the *authoritative style guide*.
2. **Scan the codebase** → identify violations (inline handlers, globals, duplicated strings, lack of constants, cross-component state leakage, etc.).
3. **Generate PLAN.md** → bullet list of problems and refactors needed, scoped by file. PLAN.md is a part of PR metadata. It's a transient document outlining the work on a given issue.
4. **Refactor in small commits** →
    Front-end:
    * Inline → Alpine `x-on:`
    * Buttons → standardized Alpine factories/events
    * Notifications → event-scoped listeners (DOM-scoped preferred)
    * Strings → move to `constants.js`
    * Utilities → extract into `/js/utils/`
    * Composition → normalize `/js/app.js` as Alpine composition root
    Backend:
    * Use "object-oreinted" stye of functions attached to structs
    * Prioritize data-driven solutions over imperative approach
    * Design and use shared components
5. **Tests** → Add/adjust Puppeteer tests for key flows (button → event → notification; cross-panel isolation). Prioritize end-2-end and integration tests.
6. **Docs** → Update README and MIGRATION.md with new event contracts, removed globals, and developer instructions.
7. **Timeouts**  Set a timer before running any CLI command, tests, build, git etc. If an operation takes unreasonably long without producing an output, abort it and consider a diffeernt approach. Prepend all CLI invocations with `timeout -k <N>s -s SIGKILL <N>s` command. Theis is MANDATORY for each and every CLI command.

## Output requirements

* Always follow AGENTS.md rules (do not restate them, do not invent new ones).
* Output a **PLAN.md** first, then refactor step-by-step.
* Only modify necessary files.
* Descriptive identifiers, no single-letter names.
* End with a short summary of changed files and new event contracts.

**Begin by reading AGENTS.md and generating PLAN.md now.**

## Rules of engagement

Review the NOTES.md. Make a plan for autonomously fixing every item under Features, BugFixes, Improvements, Maintenance. Ensure no regressions. Ensure adding tests. Lean into integration tests. Fix every issue. Document the changes.

Fix issues one by one, working sequentially. 
1. Create a new git bracnh with descriptive name, for example `feature/LA-56-widget-defer` or `bugfix/LA-11-alpine-rehydration`. Use the taxonomy of issues as prefixes: improvement/, feature/, bugfix/, maintenace/, issue ID and a short descriptive. Respect the name limits.
2. Describe an issue through tests. 
2a. Ensure that the tests are comprehensive and failing to begin with. 
2b. Ensure AGENTS.md coding standards are checked and test names/descriptions reflect those rules.
3. Fix the issue
4. Rerun the tests
5. Repeat pp 2-4 untill the issue is fixed: 
5a. old and new comprehensive tests are passing
5b. Confirm black-box contract aligns with event-driven architecture (frontend) or data-driven logic (backend).
5c. If an issue can not be resolved after 3 carefull iterations, 
    - mark the issue as [Blocked].
    - document the reason for the bockage.
    - commit the changes into a separate branch called "blocked/<issue-id>".
    - work on the next issue from the divergence point of the previous issue.
6. Write a nice comprehensive commit message AFTER EACH issue is fixed and tested and covered with tests.
7. Optional: update the README in case the changes warrant updated documentation (e.g. have user-facing consequences)
8. Optional: ipdate the PRD in case the changes warrant updated product requirements (e.g. change product undestanding)
9. Optional: update the code examples in case the changes warrant updated code examples
10. Mark an issue as done ([X])in the NOTES.md after the issue is fixed: New and existing tests are passing without regressions
11. Commit and push the changes to the remote branch.
12. Repeat till all issues are fixed, and commits abd branches are stacked up (one starts from another).

Do not work on all issues at once. Work at one issue at a time sequntially.

Leave Features, BugFixes, Improvements, Maintenance sections empty when all fixes are implemented but don't delete the sections themselves.

## Issues

### Features

    - [X] [PB-22] Add an ability to like a prompt on a card: add a bubble button with a counter. A single user can like a card once. liking it twice removes the like, so it works as a toggle. The icon is the bubble. The button is in the middle of the card bottom, between Copy and Share buttons. The icon shows the number of likes starting from 1.

### Improvements

    - [X] [PB-02] Restyle the site using material design, and follow the implementation gudiance.
        - Replace custom layout with Bootstrap and Material Design theme
        - Add fixed top and bottom navbars with search and dark mode switch
        - Render prompt cards in a responsive Bootstrap grid with fixed heights
    - [X] [PB-06]  Develop an appropriate favicon usng SVG. Fix the error:
        `Static server: ENOENT: no such file or directory, open '/Users/tyemirov/Development/MarcoPoloResearchLab/prompts/favicon.ico'`
    - [X] [PB-07] Increase the horizontal size of the space for the magnifying glass in the search prompt. It is too tight now, so that the horizontal borders of the button touch the icon
    - [X] [PB-08] Horizontally align the theme toggle and the label, so that "Dark/Light mode" is visually aligned with the toggle
    - [X] [PB-09] The Share icon is almost invisible in the light mode
    - [X] [PB-10] make clicking on any card emit a light bubble (respect the chosen theme). That may require an external JS library. The bubble shall resemble a soap bubble very much and float on top and disappear. The bubble is kinda transparent, maybe translusent, and is the size of a quater of the card's width
    - [X] [PB-11] Move the placeholder and the text for the search to the right so that there is a little bit of space between the button and the placeholder
    - [X] [PB-13] Move "Press / to search • Enter to copy the focused card" from the bottom of the page to the footer aligneg to the right in the footer AND move "Built for instant prompt workflows." under the title "Prompt Bubbles" and make "Built for instant prompt workflows" small font (like 6)
    - [X] [PB-14] Make bubble float up the top edge of the card in which the click happened.
    - [X] [PB-21] Replace in the footer the label Prompt Bubbles with "Built by Marko Polo Research Lab". the "Marko Polo Research Lab" part is a drop-down that displays other Marko Polo projects.
        - The functionality to mimic is
        ```go
            var (
            footerTemplate = template.Must(template.New("footer").Parse(`<footer id="{{.ElementID}}" class="{{.BaseClass}}">
        <div id="{{.InnerElementID}}" class="{{.InnerClass}}">
            <div class="{{.WrapperClass}}">
            <span class="{{.PrefixClass}}">{{.PrefixText}}</span>
            <button id="{{.ToggleButtonID}}" class="{{.ToggleButtonClass}}" type="button" data-bs-toggle="dropdown" aria-expanded="false">{{.ToggleLabel}}</button>
            <ul class="{{.MenuClass}}" aria-labelledby="{{.ToggleButtonID}}">
                {{range .Links}}
                <li><a class="{{$.MenuItemClass}}" href="{{.URL}}" target="_blank" rel="noopener noreferrer">{{.Label}}</a></li>
                {{end}}
            </ul>
            </div>
        </div>
        </footer>`))
            footerLinks = []FooterLink{
                {Label: "Marco Polo Research Lab", URL: "https://mprlab.com"},
                {Label: "Gravity Notes", URL: "https://gravity.mprlab.com"},
                {Label: "LoopAware", URL: "https://loopaware.mprlab.com"},
                {Label: "Allergy Wheel", URL: "https://allergy.mprlab.com"},
                {Label: "Social Threader", URL: "https://threader.mprlab.com"},
                {Label: "RSVP", URL: "https://rsvp.mprlab.com"},
                {Label: "Countdown Calendar", URL: "https://countdown.mprlab.com"},
                {Label: "LLM Crossword", URL: "https://llm-crossword.mprlab.com"},
                {Label: "Prompt Bubbles", URL: "https://prompts.mprlab.com"},
                {Label: "Wallpapers", URL: "https://wallpapers.mprlab.com"},
            }
        )
        ```
    - [X] [PB-28] The second sticky row with the filters/banges must be inconspcious -- it is currently in some oval elemnts, that should go away. The row with filters must fit in a single row, so there will be no two rows of badges.
    - [X] [PB-29] Change the bubbles to only float when a bubble icon is pressed
    - [X] [PB-30] Review the theme as allpied to all elemnts on the page. The share button still poorly styled for both dark and light themes: it gets light highlighting in the darm mode and is poorly visible in light mode. Use the same styling as the copy button

### BugFixes

    - [X] [PB-12] Some rows have 3 cards for no obvious reason while other rows have 4 cards. In other scenarios some rows have 4 cards and other 5 cards. All rows should have the same number of cards at a given width of a viewport
    - [X] [PB-15] make "No prompts match your search" message the selected theme. Ensure we say "No prompts match your search" and we dont say 
    "No prompts match your search/filter."
    - [X] [PB-16] The X that should be dynamically available at the end of the search prompt in response to input is no longer appearing. Fix the regression.
    - [X] [PB-17] Ensure that the placheolder dont grow over the borders of the cards. e.g. "Person (e.g. a professional in your field)" goes outside of the card borders
    - [X] [PB-18] The number of columns shall be dynamic and change in response to the width of the viewport but it shall be the same for a given width of a viewport, and it was inconsistent. Now the max is locked in on 4 and it's incorrect we shall nto prescribe the max -- as many as will fit in the viepoirt given that each row has the same number of cards unless it's the last row. So, there can be 25 cards in a row if the width allows for it.
    The search prompt changes to dark background in the light theme
    - [X] [PB-19] There are two x signs when text is entered in the search prompt: one is constantly visible, and one is appearing on mous hover. There must be only one x sign, which cleans the search prompt. The x sign must be visible if there is text in the search input. There must be no x signs if there is no text. Clicking on x clears the text. Fix the regression.
    - [X] [PB-20] When clicked, the bubble slows down to the middle of the card and then continues its ascend. There shall be no slowing down.
    - [X] [PB-23] The word Copy in light theme is pale and hardly visible on a button
    - [X] [PB-24] The badges / filters button shall be sticky -- always visible.
    - [X] [PB-25] the `npm test` command does not display which tests are running making it difficult to asses coverage of progress or failures. Make npm test output the tests to stdio
    - [X] [PB-33] The bubble floats within the card, so if the card is partially hidden byt he filtering row/header, the bubble goes underneath them. It's as if the card was a window into some world where there are bubbles, but the bubbles can't eascape the borders of the cards.
    - [X] [PB-34] The filtering buttons must be evenly spread across the width of the viewport. 
    - [X] [PB-35] The filtering buttons must not touch the top or the bottom border of the row they are in
    - [X] [PB-36] The ALL filter button must render with a leading star and uppercase label while remaining selectable
    - [X] [PB-37] Make the Built By marko Polo Research Lab open the dropdown UP and not down. Write the tesst verifying the visiblility of the dropdown after it has been clicked on
    - [X] [PB-39] PB-33 is not fixed. Ensure that the bubble is only visible within the confinements of the card and is flaoting under the top border of the card or any obstrructing element, and can not be seein outside the card.
    - [X] [PB-40] The bubble floats up when the bubble button is pressed, and it floats down back into the button when the button is depressed so the animation reverses when unliking.

### Maintenance

    - [X] [PB-01] Write tests covering current functionality and the layout blueprint. Add test coverage and get to the high degree of test coverage
    - [X] [PB-03] Clicking on copy or share doesnt produce a message withing the card to indicate that the card was copied or shared
    - [X] [PB-04] Theme doesnt fully switch the colors -- the background, the headers, the search the bagdes stay the same 
    - [X] [PB-05] There are multiple X signs in the search prompt when the prompt is entered at the end of the prompt -- as a button and as an inline x. only leave the inline x
    - [X] [PB-26] add a small “Privacy • Terms” link. and I mean small. it must serve a page under /privacy
        ```html
        <!doctype html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <title>Privacy Policy — RSVP</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex,nofollow">
        <style>
            body{font:16px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:40px;max-width:800px}
            h1{font-size:1.6rem;margin-bottom:.2rem}
        </style>
        </head>
        <body>
        <h1>Privacy Policy — Prompts Bubbles</h1>
        <p><strong>Effective Date:</strong> 2025-10-11</p>
        <p>RSVP uses Google Identity Services to authenticate users. We receive your Google profile
            information (name, email, profile image) only to sign you in. We do not sell or share your data,
            and we only store your notes so the service functions.</p>
        <p>To request deletion of your data, contact
            <a href="mailto:support@mprlab.com">support@mprlab.com</a>.</p>
        </body>
        </html>
        ```
    - [X] [PB-27] add privacy to the sitemap
    - [X] [PB-28] Tesst dont show what tests are running, what has passed, what is the code coverage.
        ```shell
        13:20:47 tyemirov@Vadyms-MacBook-Pro:~/Development/MarcoPoloResearchLab/prompts - [maintenance/PB-27-sitemap-privacy] $ npm test

        > test
        > node tests/run-tests.mjs

        Running specs/app-flows.spec.mjs
        ✓ specs/app-flows.spec.mjs
        Executed specs: specs/app-flows.spec.mjs
        All tests passed
        ```
    - [X] [PB-29] Tesst dont show what tests are running, what has passed, what is the code coverage. CHange the configuration so that `npm test` displays the running tests
        ```
        13:21:28 tyemirov@Vadyms-MacBook-Pro:~/Development/MarcoPoloResearchLab/prompts - [maintenance/PB-27-sitemap-privacy] $ npm test

        > test
        > node tests/run-tests.mjs

        Running specs/app-flows.spec.mjs
        ✓ specs/app-flows.spec.mjs
        Coverage summary: Total 12.06% (343448/2848610 bytes) | JS 28.32% (309074/1091452) | CSS 1.96% (34374/1757158)
        Running specs/runner-output.spec.mjs
        ✓ specs/runner-output.spec.mjs
        Executed specs: specs/app-flows.spec.mjs, specs/runner-output.spec.mjs
        All tests passed
        ```
    - [X] [PB-30] The badges filtering is inconscpicious -- it doesnt have a border, it doesnt have a horizontal or a vertical scroller. It's an alwyas present sticky row with badges, and all badges are always visible in one row. No matter how small the page, the badges just proportianlly decrease. If the page is very wide, the bagdes spread out. It's a sticky row of constant number of badges, always visible. They dont become larger than current size, but then get very very small if the page is narrow in order to fit in the row. The filtering row is a second row attached to the header. there is no space between them.
    - [X] [PB-31] Bug: Theme doesn't fully switch the colors of the privacy page.
        1. Clicking on Prompt Bubble in the fotter returns the user to the top of the Prompt Bubble page with cards
        2. The footer and the header are always visible on all pages. Refactor the code so that The footer and the header are visible on the Privacy page.
        3. There is no search prompt when the footer is on the privacy page
        4. There is no filtering badges row when the footer is on the Privacy page
    - [X] [PB-32] Refactor the footer
        1. "Privacy • Terms" in the footer font is 3 -- it is very, very small.
        2. "Privacy • Terms" in the footer is aligned to the left.
        3. Built By Marco Polo Research Lab is aligned to the right.
        4. The order of labels in the footer from left to right: "Privacy • Terms", Theme toggle, spacer, "Press / to search • Enter to copy the focused card", Built By Marco Polo Research Lab
        5. Built By Marco Polo Research Lab is a drop up, so to speak -- it shows the menu of the sites above itself
