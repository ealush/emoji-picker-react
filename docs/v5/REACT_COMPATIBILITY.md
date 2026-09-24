# v5 React 16.8, SSR and Identity Contract

v5 retains `peerDependencies.react >=16.8`.

That decision has runtime consequences and is verified with real old-React consumers, not only source scanning.

## 1. Runtime API floor

While the peer floor remains 16.8, runtime implementation MUST NOT depend on:
- `useId`;
- `useSyncExternalStore`;
- `useInsertionEffect`;
- `useTransition`;
- `useDeferredValue`;
- React 18 root APIs.

The existing static React-floor scan remains useful but is not sufficient by itself.

## 2. Real compatibility fixtures

CI MUST build the published/packed v5 artifact and execute a minimal consumer against:
- React 16.8.x + matching ReactDOM;
- the repository's current React version.

The React 16 fixture must verify:
- default picker mount/unmount;
- primitive Root/Panel/Search/Viewport/List mount;
- click selection;
- keyboard search/navigation smoke path;
- SSR render using `react-dom/server`;
- hydration using the React-16-supported hydration API;
- no runtime missing-hook errors.

Type declarations are compiled against a compatible `@types/react` fixture as part of package validation where practical.

## 3. Remove global hard-coded IDs

v5 MUST remove fixed document-global IDs such as:
- `epr-search-id`;
- `epr-category-nav-id`.

Prefer semantics that do not require an ID:
- a polite status live region does not require the input's `aria-controls`;
- category tabs should point to a controlled panel only when such a real panel relationship exists; they must not all point at the tablist itself;
- internal navigation uses refs/registry rather than document IDs.

## 4. idPrefix escape hatch

Root/default picker adds:

```ts
idPrefix?: string;
```

Rules:
- when supplied, every library-owned DOM ID under that Root starts with the sanitized prefix;
- consumers are responsible for choosing a unique prefix when rendering multiple independently hydrated SSR roots that require ID-based ARIA relationships;
- v5 should avoid emitting an ID at all when the semantic relationship can be expressed without one;
- no library-owned global constant ID may appear in multiple Roots;
- changing `idPrefix` after mount is unsupported and may warn in development.

The default no-prefix path MUST remain hydration-safe. Therefore v5 may not invent a render-time global counter whose server/client ordering must coincidentally match.

If a future primitive requires an ID relationship that cannot be omitted safely without `idPrefix`, that primitive's documentation must say so before release.

## 5. Internal subscriptions

Because `useSyncExternalStore` is unavailable, v5 should prefer:
- stable service objects in context;
- narrowly split state contexts;
- refs for imperative/high-frequency state;
- React 16.8 `useState`/`useEffect` only where subscription is needed.

Do not recreate an omnibus frequently changing context merely to avoid a React-18 API.

## 6. Hydration

The first client render must structurally match SSR output.

Specifically:
- no localStorage-derived suggestions before hydration completes;
- no client-only generated IDs in first-render markup;
- no viewport measurements that change required server markup before effects;
- controlled search initial markup derives only from props;
- native/document queries begin after mount.

Hydration tests run with multiple picker Roots in the same document.

## 7. Accessibility identity tests

Acceptance must assert:
- two default pickers contain no duplicate library-owned IDs;
- two primitive Roots contain no duplicate library-owned IDs;
- when unique `idPrefix` values are provided, every generated ID is namespaced correctly;
- every `aria-controls`, `aria-labelledby`, and `aria-describedby` value resolves to an element within the same Root unless intentionally external;
- no ARIA relationship crosses picker instances.
