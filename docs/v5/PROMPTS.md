# Copyable setup, customization and migration prompts

Copy a block into your coding agent. Replace the bracketed fields where present;
leave them blank to use your application's existing conventions. Attach a
screenshot or selected recipe's implementation files when asking for a design.
Each prompt includes version discovery so it also works in an existing project.

The prompts target emoji-picker-react 5. A 4.x installation does not provide
primitives, `unstyled`, `columns`, `components`, `labels` or loader
`emojiData`, so each prompt checks the installed version first. The installed
package's `llms-full.txt` describes that exact version.

## Quick setup

Use this when you want a working picker with its built-in appearance.

```text
Integrate emoji-picker-react into this application's emoji entry flow.

Inspect package.json, the lockfile, the resolved package version and exports,
and the installed llms-full.txt. Use the existing package manager and
framework conventions. If the installed version is below 5, upgrade to
emoji-picker-react@5 (or explain why you cannot) before using v5 APIs.

Start with the default EmojiPicker component. It needs no stylesheet import
or primitives. Prefer colorScheme="auto" for v5. Connect onEmojiClick's data
payload to the existing application state. For a text composer, insert
data.emoji at the saved selection, preserving surrounding text and restoring
the caret. Map custom emoji IDs to the application's representation.

The application owns the trigger, popover/dialog, placement and dismissal.
Preserve focus restoration and let picker menus handle Escape before closing
the host. In an RSC application, keep interactive UI in a client component;
use only emoji-picker-react/data for server-side search or lookup.

Deliver the changed files and exact setup commands. Run the application's
existing type/build checks and verify selection, search, keyboard navigation,
dismissal and focus restoration. Report any checks you could not run.
```

## Match my brand

Use this for colors, typography, radii and spacing while retaining the built-in
picker layout. Describe your visual requirements or attach a screenshot.

```text
Customize this application's emoji-picker-react to match:
[brand colors, typography, light/dark requirements, or attached screenshot]

Inspect the installed version, exports and matching llms-full.txt before
choosing APIs; v5 features need emoji-picker-react 5 or later. Preserve the
existing integration, callbacks and state ownership.

Keep the default EmojiPicker and theme its built-in appearance using a scoped
className and documented --epr-* variables. Use this application's existing
styling solution and prefer colorScheme over theme. Keep light and dark text,
backgrounds and focus indicators readable. For Tailwind v4, declare the epr
layer before the application's layers and pass cssLayer="epr".

Use documented size tokens or columns for sizing; preserve viewport overflow,
virtualized cell positions and category geometry. Avoid hashed internal class
names. If changing composition or markup is actually necessary, explain that
choice and use the supported primitives/components contracts.

Deliver the component and styling files, show where each is imported, and
explain how to adjust the colors and dimensions. Check both color schemes,
small containers, keyboard focus and the application's type/build checks.
```

## Build with my design library

Use this when you want your own layout or controls. The styling library field
can name CSS Modules, Tailwind, shadcn/ui, Emotion, styled-components, MUI,
ShipStyles or StyleX. Use the library already configured in the application;
its own version and build setup determine the available styling APIs.

```text
Build an emoji picker matching [design or attached screenshot] using
[styling/design library already used by this application].

Inspect the installed emoji-picker-react version, exports and llms-full.txt,
and the styling library's installed version and existing configuration. Use
documented v5 APIs and real library APIs. Include any necessary setup changes.

Choose the smallest supported approach: theme EmojiPicker for its existing
look, use EmojiPicker unstyled for its supplied layout with my appearance, or
use emoji-picker-react/primitives when I need my own composition or controls.
Color tokens theme the built-in appearance; bare Root and unstyled need part
styles. Root appearance="default" intentionally reuses built-in leaf styling.

For primitives, JSX determines presence and placement. Root renders only its
children. Omit unwanted parts; put SkinTone where it belongs. For compact
reactions, compose Reactions outside Panel and expanded content inside Panel.
Do not add composition, panelProps or legacy visibility switches to Root.
Use SearchInput as with a ref-forwarding input adapter when appropriate.
Keep component identities stable and preserve managed refs, handlers, style,
ARIA and data-epr-* props on the required underlying elements. Preserve
viewport overflow, cell geometry, virtualization and keyboard navigation.

Connect selection, controlled state and host dismissal to the application.
Deliver complete files, dependencies and setup, with checks for search,
selection, focus, Escape, responsive layout and the existing type/build gates.
```

## Adapt a recipe

Attach the selected recipe's source files and specify its styling variant.
The current catalog supplies CSS, CSS Modules, Emotion, styled-components,
MUI, Tailwind and shadcn/ui variants. A variant for another library needs a
real implementation and verification before being described as available.

```text
Adapt the attached emoji-picker-react recipe into this application:
Recipe: [name]
Styling variant: [library]
Integration target: [composer, comment field, status dialog, or other surface]

Read the attached source and inspect the application's installed versions,
package exports and matching llms-full.txt. Keep the recipe's actual picker
composition, interaction behavior and styling in the selected library. Use
documented v5 APIs. If the supplied files do not include the requested variant,
identify that gap and implement it using the installed styling library's APIs.

Replace mock application chrome and state with our real components and data.
Preserve insertion at the saved selection, custom emoji mapping, controlled
state ownership, dismissal and focus restoration. Do not send a message when
an emoji is selected. Preserve library-owned navigation, ARIA, virtualization,
managed props and refs. Primitive presence belongs to JSX.

Deliver all required component, styling and setup files, with exact import
paths and dependencies. Explain the integration points and customization
options. Run the application's existing checks and verify the recipe's
interactive states and light/dark/responsive requirements. Report limitations.
```

## Audit a v4-to-v5 migration

Use this for a review and migration plan before changing application code.

```text
Audit this application's migration from emoji-picker-react v4 to v5.
Produce a file-specific plan before making implementation changes.

Inventory picker imports, resolved versions, props, callbacks, controlled
state, locale datasets, custom emojis, CSS selectors and interaction tests.
Read documentation matching the v5 target version, its package
llms-full.txt, and its migration/API compatibility contract.

Separate required compatibility work from optional adoption of new features.
Keep the default EmojiPicker where it already meets our needs. Existing enums,
theme and useful default-picker visibility props remain supported; primitives
are optional. Prefer colorScheme in new CSS-in-JS integrations.

Call out the native emoji default and platform support filtering; an explicit
emojiStyle="apple" preserves image rendering where required. Audit supported
package subpaths and deprecated locale aliases, changed managed markup/grid
roles, zero-specificity tokens and cascade layers, responsive column spacing,
prop updates after mount, widened enum/literal types, and SSR/client boundaries.
Preserve callback payloads, search/skin-tone ownership and custom emoji IDs.

Return required changes by file, optional improvements separately, behavior
choices needing a product decision, and a verification plan covering types,
search/IME, selection, focus, Escape, localization, themes and representative
platforms. Review intentional visual changes before updating image baselines.
```

## Apply a v4-to-v5 migration

Use this after choosing a target and reviewing the audit. State whether you
want to keep the previous image appearance or adopt native emoji rendering.

```text
Migrate this application to emoji-picker-react v5:
[target version, e.g. latest 5.x]
Appearance policy: [retain Apple images / adopt native emoji rendering]
Approved audit or requirements: [attach or describe]

Inspect the current code, resolved versions and target-version documentation,
including its migration/API compatibility contract and llms-full.txt. Use the
project's package manager and update its lockfile consistently. If the target
cannot be resolved, report that before changing code to depend on it.

Make the required compatibility changes while preserving working callbacks,
custom emojis, locale behavior, host integration and controlled state. Keep
existing supported APIs and use the default picker unless our layout requires
primitives. Preserve Apple rendering with explicit emojiStyle="apple" when
requested; explain native platform filtering if adopting the native default.
Use canonical documented package entries and stable data-epr-part selectors.
Prefer colorScheme when touching styling-library wrappers. If using primitives,
compose presence through JSX and keep Reactions outside the expanded Panel.

Update affected tests to assert public behavior and managed grid semantics:
emoji grid cells use role=gridcell and categories use named rowgroups. Retain
keyboard, search/IME, skin tone, custom emoji, focus-restoration, nested-Escape,
locale and responsive coverage. Check the actual host popover/dialog and SSR
path. Review visual differences individually; do not bulk-replace baselines.

Deliver the changes, setup commands, compatibility decisions and verification
results. List remaining manual or platform checks and any unresolved blockers.
```

## API references

These prompts guide integration; the API contracts remain authoritative:
[default picker props](../../PROPS.md), [v5 API](API.md),
[primitives](PRIMITIVES.md), [customization](../../CUSTOMIZATION.md),
[localization](../../INTERNATIONALIZATION.md) and [data API](DATA_API.md).
