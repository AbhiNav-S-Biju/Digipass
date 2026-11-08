---
version: 1
slug: "frontend-dashboard-html"
primary_target: "frontend/dashboard.html"
related_targets: ["frontend/executor-dashboard.html"]
---

# Dashboards: owner + executor (Operate)

Scope: frontend/dashboard.html (Overview, Digital Assets, Executors, Digital Will, Dead Man's Switch) and frontend/executor-dashboard.html. Mode: Operate. Build path: code-led. Direction pinned by the user's reference image (project-board app: icon rail, secondary panel, segmented view tabs, pill toolbar, kanban columns of rounded white cards); palette pinned by PRODUCT.md.

Audience/job: owners keep each account's after-death wish current; executors work through accounts one by one, calmly.

## Direction contract

THESIS: The estate is a board. Every account is a card sitting in the column of its fate: owners see Pass on / Delete / Last message; executors see Not started / In progress / Taken care of. Refuses the category default of stat tiles over a table.

OWN-WORLD: Sand-tinted ground (#ece3d2), cream panels (#fdf6ec), cream columns (#f5ead8), white cards with 18px radius and a soft offset shadow. Forest #1b3a2d for the active rail disc and the primary pill. Tags in sage #d4ead8, sand #e8d9c0, forest-tint. DM Sans throughout; the logo keeps DM Serif.

STORY: Owner opens, sees readiness and what is left; drags nothing, but every card shows its fate and one menu to change it. Executor sees what is done and what remains, and opens steps.

FIRST VIEWPORT: 64px icon rail left; 248px panel (estate nav with counts, people list, forest gradient check-in card); main: title + segmented Board/List tabs + Invite pill right; search pill, filter pills, forest "Add" pill; three columns.

FORM: The user's pinned reference image (a project-board app), position 1 of 1. The concept roll ran after the build was underway; the user-pinned direction beats the roll, so the pinned image governs and the roll's assignment was not used. seed:311f4ba18eb00056

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: an executor finishing steps in the workflow window moves that card to "Taken care of" live on the board (cross-tab storage event), with a short settle animation.
