# Unstyled and composable API research

> Historical assessment at the revisions named below. Branch names, proposed APIs and release processes describe that date. For the current contract, see [the v5 documentation](../v5/README.md).

Research date: 2026-10-05. EPR assessed at `503370b61d99c400df33fe32f6b61f91a0026855` on `v5-implementation`, PR #552. This is a research and design recommendation, not a replacement for the current API contract. Proposed names and examples below are not shipped APIs.

The main finding: v5 supports useful composition, but its BYOD promise is broader than its current replacement surface. The next investment should make appearance ownership consistent and let applications replace the interactive leaves of the picker. General DOM polymorphism helps, but cannot solve inaccessible internal controls or compulsory layout on its own.

## Scope and confidence

This is a qualitative comparison of official documentation and selected implementation source, not a market-share survey or a new performance/accessibility benchmark. “Prevalent” means recurring across the reviewed libraries. A documented feature is not proof of equivalent behavior, accessibility or performance.

Evidence covers published 2025 changes and current 2026 documentation. 2027 has not happened; the final section labels forecasts explicitly. Frimousse's current documentation advertises v0.4.0; its examined source is pinned to `5723fc11a8162b3b795cd2f5d1164bd6795ae30e`. Other documentation links are live pages checked on the research date.

## Direct emoji-picker competitors

| Library | Public customization model | Lesson for EPR |
| --- | --- | --- |
| Frimousse | Named Root/Search/Viewport/List parts; List component replacements for Emoji, CategoryHeader and Row; hooks and render-callback components for active emoji and skin tone. A few sizing/overflow defaults remain. Unicode text datasets; image/sprite emoji are excluded. | Closest comparison for composability. Its small default rendering surface and explicit geometry requirements make ownership easy to understand. EPR's custom-image support is a separate advantage. [Official API](https://frimousse.liveblocks.io/), [pinned source](https://github.com/liveblocks/frimousse/blob/5723fc11a8162b3b795cd2f5d1164bd6795ae30e/src/components/emoji-picker.tsx). |
| Emoji Mart | Complete picker configured with props, separate data loading, standalone emoji rendering and headless search. Options select preview/search/tone positions; custom image emoji are supported. | Data/search independence is useful, but is not the same capability as replacing the picker UI. Compare rendering composition separately from data APIs. [Maintainer README](https://github.com/missive/emoji-mart). |
| emoji-picker-element | Web component with Shadow DOM, CSS variables and JavaScript configuration/events. Deeper styling requires injecting styles into the shadow root. | Strong isolation and framework independence serve a different need from composing an application's existing React input/button components. [Maintainer README](https://github.com/nolanlawson/emoji-picker-element). |

Frimousse is a meaningful reference, but it is not an argument to copy every exported part. A Row replacement is useful there because its measured row is an actual customization boundary. EPR currently positions virtualized cells within category containers; adding an identically named slot without matching its geometry responsibilities would be misleading. This is an implementation-level inference from the two renderers.

## Comparable reusable components and libraries

| Reference | Observed pattern | Relevant implication |
| --- | --- | --- |
| Radix Primitives | `asChild` applies behavior to a child node instead of adding another node. Custom leaves must spread props and forward refs. Consumers must preserve accessible semantics. | Replacement must target the actual input/button, rather than a cosmetic wrapper. [Composition](https://www.radix-ui.com/primitives/docs/guides/composition). |
| Base UI | Named compound parts plus `render` accepting a React element or `(props, state)` function. Custom components must forward props/ref. | Element composition carries design-library options naturally; callback composition exposes state and explicit prop placement. [Composition](https://base-ui.com/react/handbook/composition). |
| React Aria Components | `render` replaces the DOM element; contexts/slots support custom compositions and lower-level hooks provide further control. Replacement requires one root, the expected element type and forwarded props. | Rendering flexibility and semantic restrictions can coexist. [Customization](https://react-aria.adobe.com/customization), [hooks](https://react-aria.adobe.com/hooks). |
| Headless UI Combobox | Compound input/options/option parts; `as`, state attributes and render callbacks; virtual options use an item template. Application owns filtering. | A managed collection can expose item rendering without asking applications to reproduce its navigation or virtualizer. [Combobox](https://headlessui.com/react/combobox). |
| Ark UI | `asChild`, state/context hooks and optional external controllers through RootProvider. Named data parts/state attributes. | Expose focused actions as well as state; make component anatomy observable. [Composition](https://ark-ui.com/docs/guides/composition), [component state](https://ark-ui.com/docs/guides/component-state), [styling](https://ark-ui.com/docs/guides/styling). |
| Ark UI Color Picker | Separate area, thumbs, channels, swatches, triggers and content; supports inline and reduced compositions such as slider-only or swatch-only. | A complex picker can expose meaningful subsets instead of forcing one complete layout. [Color Picker anatomy](https://ark-ui.com/docs/components/color-picker). |
| React DayPicker | Typed `components` replacements for calendar elements, a context hook, and separate formatters for simple text changes. Documents preserving props, refs and behavior. | Component maps are an established fit for generated grids; they complement compound parts. [Custom components](https://daypicker.dev/guides/custom-components). |
| cmdk | Compound command-menu parts, controlled input, optional application filtering and selector-based state subscriptions. Its README explicitly says virtualization is not built in. | Copy its small subscriptions and host integration boundaries, not an assumption that arbitrary item composition gives EPR virtualization for free. [Maintainer API](https://github.com/dip/cmdk). |
| Downshift | Hooks return prop getters and state; controlled values and a state reducer permit behavioral customization. | A lower-level controller is a distinct product surface with substantial support obligations, not merely more styling freedom. [useSelect](https://www.downshift-js.com/use-select/). |
| TanStack Virtual | Headless virtualizer returns measurements/items and renders no markup or styles. | Shows what a genuinely renderer-independent layer entails. It supplies neither EPR's emoji-specific behavior nor a complete accessibility contract. [Introduction](https://tanstack.com/virtual/latest/docs/introduction). |

## Patterns established in 2025–2026

### 1. Several composition syntaxes coexist

`as` selects a component type, `asChild` merges into a supplied child, and `render` supplies an element or a rendering function. These are related capabilities, not interchangeable spellings. A render callback used for content does not necessarily replace the outer DOM node.

There is no universal winner. Radix/Ark use child composition; Headless UI exposes `as`; Base UI and current React Aria expose `render`. My recommendation is to prototype a single canonical `render` contract for EPR's replaceable leaves, keeping existing SearchInput `as` as a compatible convenience if worthwhile. The important contract is the node, props, state and ref—not adopting three overlapping APIs.

### 2. State is usable without reconstructing behavior

State attributes make CSS/Tailwind styling possible; typed state values support content and animations. Public hooks/context methods let a custom control invoke the same operation as the managed control. Base UI also supports state-dependent `className` and `style`; dynamic geometry is exposed through CSS variables. [Base UI styling](https://base-ui.com/react/handbook/styling).

For EPR, active emoji, category, tone, loading and mode are different states. Hover/keyboard focus must not be described as persistent selection. A new search controller should distinguish accepted text, the applied debounced query and filtering status; consumers should not have to guess why the input and result count temporarily describe different queries.

### 3. Prop merging is public behavior

Base UI's merge utility combines handlers, classes and styles, but does not merge refs; its synthetic-event mechanism distinguishes canceling library behavior from native `preventDefault()`. Radix Slot gives the child's handler precedence and documents `defaultPrevented` ordering. These differ from EPR's current internal-first, non-cancelable behavior. [Base UI mergeProps](https://base-ui.com/react/utils/merge-props), [Radix Slot](https://www.radix-ui.com/primitives/docs/utilities/slot).

EPR should document a per-operation policy: compose consumer handlers, merge both refs, merge decoration styles, and preserve required semantic/position attributes. Consider cancellation for optional actions such as selection or opening a variations menu; cancellation must not silently suppress required input reconciliation, focus bookkeeping or IME handling. Native delegated listeners also need a deliberate policy—changing a React prop merge helper alone cannot change them.

### 4. Unstyled still has structural requirements

The reviewed systems preserve behavior and may require measurement, positioning, overflow or sizing rules. Unstyled should mean no imposed design language, rather than no geometry. EPR can retain virtualization geometry while moving color, radius, typography, shadows, blur, hover treatment and decorative indicators to its styled composition. The contract must distinguish supported size changes from arbitrary changes that invalidate measurement.

### 5. Ready-made components are an adoption layer

Composed examples and installable registry wrappers reduce setup while retaining the lower-level API. They should not imply that users must adopt a particular CSS system or overlay library. EPR's existing default picker and registry are suitable layers for this approach.

shadcn's direction is especially relevant: Base UI reached stable 1.0 on December 11, 2025; shadcn documented both bases in January 2026, made Base UI the default in July, and added React Aria as another first-class base that month. Radix remains supported. This is evidence of multiple interoperable behavior libraries, not proof that every existing application should migrate. [Base UI releases](https://base-ui.com/react/overview/releases), [January announcement](https://ui.shadcn.com/docs/changelog/2026-01-base-ui), [July default announcement](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), [React Aria announcement](https://ui.shadcn.com/docs/changelog/2026-07-react-aria).

### 6. Component anatomy is part of agent documentation

shadcn added explicit composition trees in April 2026 to help humans and coding agents understand nesting and required parts. Its CLI can retrieve those docs. EPR's full-text guide is a good foundation; executable examples should encode singleton constraints, legal wrappers, prop/ref routing, and which renderer callbacks replace nodes versus content. [Composition announcement](https://ui.shadcn.com/docs/changelog/2026-04-component-composition).

## Where EPR v5 stands

These are findings from local source and contracts at the assessed commit, not claims about unpublished changes.

| Boundary | Current capability | Gap for the main BYOD promise |
| --- | --- | --- |
| Appearance | `unstyled` removes Root chrome; bare Root applies structural tokens and shared part styles. Custom List cells/headers shed default decoration. | Managed search, tabs, tone/variation controls and empty/preview UI still carry presentation. A composed picker is unbranded in several places, rather than consistently free of design decisions. |
| Search | Native SearchInput and typed input `as`; managed Search combines input/icon/clear/status/tone UI. | Replacement syntax is unique to SearchInput. There is no standalone managed clear-button primitive/action for an uncontrolled custom toolbar. |
| Generated grid | List replaces Emoji and CategoryHeader, exposes active state, retains virtualization. | Useful and appropriate. Structural replacement beyond those slots needs measured evidence; extra wrappers can violate keyboard/measurement assumptions. |
| Category navigation | Managed CategoryNav supports axis choice. | Individual tab buttons, icons and content are not replaceable through its public API. Styling the wrapper cannot turn those controls into an application's own buttons. |
| Tone/variations | Managed SkinTone plus public tone setter; variation overlay stays internal. | The setter enables a custom tone control, but does not register its keyboard region. Variation trigger/items/content have no equivalent replacement surface. |
| Preview/status | Active-emoji and loading/search hooks support custom displays. | Managed Preview owns descendants. Distinguish an optional opinionated preview from the lower-level state API rather than suggesting it can render arbitrary children. |
| Root/layout | Root renders an aside, implicit panel and automatic reactions; panelProps targets one hidden wrapper. | Applications cannot substitute or move reactions as a public part. State, presence, layout and compact pill styling are coupled. Ordinary registered parts cannot be portaled outside Root. |
| State/actions | Active emoji, tone setter, read-only search state, loading/retry. | No corresponding public category navigation, clear-search or mode controller for arbitrary custom controls. A data lookup API does not fill that UI gap. |
| Events | Internal handlers run first; cancellation of required behavior is unsupported. | Deliberate, but comparatively restrictive for extending selection and optional interactions. Must be evaluated before general render composition. |

Source anchors: [Root](../../src/primitives/Root.tsx), [structural styles](../../src/primitives/structuralStyles.tsx), [public types](../../src/primitives/types.ts), [state hooks](../../src/primitives/hooks.ts), [List slots](../../src/components/body/listComponents.tsx), [primitive contract](../v5/PRIMITIVES.md), [styling contract](../v5/STYLING.md).

The current rationale that a component with one legal position is automatically boilerplate is too strong. A part can earn its place by being the ref, semantic, presence or replacement boundary even when its structural placement is constrained. Conversely, exposing every measurement wrapper would enlarge the API without making customization safer. This is a design judgment informed by the compared anatomies.

## Recommended v5 direction

### Keep the three useful layers

1. **Batteries included:** the default EmojiPicker owns the complete layout, appearance and convenient defaults.
2. **Composable, unstyled React parts:** applications own appearance and meaningful leaf markup; EPR owns focus, semantics, navigation, loading and measured virtualization.
3. **Data/search utilities:** support lookup and search independently. A full renderer-independent UI controller remains a separate investment.

### Priorities before freezing the API

| Priority | Decision/change to prototype | Evidence required |
| --- | --- | --- |
| P0 | Remove remaining decorative styles from the unstyled/composable path; let the default composition opt into them. | Computed-style ownership checks for every part and all existing styled baselines; visible keyboard focus in supplied examples. |
| P0 | Extend typed replacement to category buttons, tone controls and variation/reaction leaves. Retain component maps for generated cells. | Existing design-library buttons/inputs work without copying EPR's event logic; native ref reaches the correct element. |
| P0 | Add focused public actions for custom search clearing, category jumping and mode changes. | Controlled proposals, callback freshness, IME, navigation registration and filtered-grid behavior match managed controls. |
| P1 | Reopen Panel/Reactions ownership. Evaluate an explicit presence boundary and independent reactions part, or a provider composition for advanced layouts. | Equivalent default behavior; custom placement and refs without forced extra wrappers; one state owner and documented nesting. |
| P1 | Define shared render/merge semantics, including optional-action cancellation and protected attributes. | Handler order, exceptions, preventDefault, two refs, React 19 cleanup, native delegation and nested/shadow-root isolation. |
| P1 | Expose complete documented state attributes and focused subscriptions. | Tailwind/CSS Modules can style all states; hovering an emoji does not rerender every cell or unrelated control. |
| P2 | Support portals for explicitly designed overlay parts if required by real integrations. | Escape ordering, focus restoration, ownerDocument, shadow boundaries, clipping and host layer interactions. React context surviving a portal alone is insufficient. |

Prototype names are intentionally provisional. For example, a category item could support `render={<DesignButton size="sm" />}`, and a variation item could expose `(domProps, state)` to a render function. For repeated grid items, retain `List components={{ Emoji: DesignEmoji }}` so the library owns item creation. A single primitive combining all of these responsibilities would make the contract harder to reason about.

I favor investigating an explicit Panel and Reactions part, but would select the final Root/provider shape after the integration prototypes. A DOM-free provider does not remove EPR's need for a registered containing/focus boundary. Introducing it without replacing DOM-containment assumptions would create a misleading escape hatch.

### Acceptance examples that should drive the design

- Existing MUI TextField/Button composition, with native inputRef routing and bordered cells; render syntax does not eliminate the adapter requirement.
- A Base UI host popover with existing application buttons; a separate Radix host exercises child composition and nested Escape. Add a React Aria host to check another focus/overlay model.
- Fully custom category rail, clear button, preview and tone control, using public parts/actions and no private imports, DOM selectors or duplicated navigation handlers.
- Custom reaction bar placed independently of the full-picker panel, with state changes preserving hidden/inert and focus behavior.
- Custom-image emoji, loading error/retry, RTL, IME, shadow DOM and mobile variants of these compositions.

Keep the React 16.8 floor unless a separate compatibility decision changes it. Several references require newer React APIs; adopting their API ideas does not justify importing utilities with incompatible runtime or type requirements. Preserve package, initial-size and performance gates while experimenting.

## 2027 direction: forecast, not an observed standard

High-confidence continuation: named parts, typed replacement, CSS-visible state, documented anatomy, and ready-made compositions over reusable behavior. These recur across multiple current systems.

Medium-confidence continuation: `render` gains adoption alongside `asChild`; more libraries expose optional external controllers and structured agent documentation. The observed Base UI/React Aria and shadcn changes support this direction, but do not establish a universal future syntax.

No evidence here establishes that everyone will abandon `asChild`, require a specific React version, move to a universal state-machine engine, or permit arbitrary DOM without semantic/geometry constraints. EPR should promise verified composition capabilities, not predict an ecosystem winner.

## Implementation follow-up

The research recommendations now have concrete v5 API changes: consistent appearance="none" for bare Root and unstyled; shared typed components maps for grid/header/category/tone/clear/expand controls, including variations and reactions; focused search/navigation/mode actions; and explicit Panel/Reactions composition with native refs and managed presence. The existing typed SearchInput as adapter remains the input replacement contract. This implementation deliberately uses components maps rather than adding a second asChild/render protocol. Optional leaf actions support cancellation before invoking their supplied managed handler; native delegated emoji selection remains observational from React bubble handlers. Arbitrary part portals and a renderer-independent engine remain outside this release. Validation evidence is recorded in docs/v5/PERFORMANCE.md and the PR.
