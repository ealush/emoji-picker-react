## [5.0.0](https://github.com/ealush/emoji-picker-react/compare/4.22.3...5.0.0) (2026-10-10)

### ⚠ BREAKING CHANGES

* The published JavaScript targets ES2020. webpack 4
setups that do not run dependencies through Babel must transpile
emoji-picker-react or upgrade; see docs/v5/MIGRATION.md.
* Native rendering checks glyph availability even when
`emojiVersion` is supplied. That prop remains an additional version cap;
choose an image style for inventory independent of installed fonts.
* v5 changes the default emoji style to native and
replaces managed markup and interaction defaults. See
docs/v5/MIGRATION.md for compatibility options and migration steps.

### Features

* add composable picker primitives ([#560](https://github.com/ealush/emoji-picker-react/issues/560)) ([0852459](https://github.com/ealush/emoji-picker-react/commit/0852459b29983e1e7cc2ed09262af06f8e59f5fc))
* add picker recipes and the design gallery ([#564](https://github.com/ealush/emoji-picker-react/issues/564)) ([8b37306](https://github.com/ealush/emoji-picker-react/commit/8b3730663df1a4f865511c4b7bd1c30e0e731bc7))
* add styling tokens, cascade layers and BYOD composition ([#561](https://github.com/ealush/emoji-picker-react/issues/561)) ([277d46e](https://github.com/ealush/emoji-picker-react/commit/277d46e31474d72d1320cbecd1b3287315b16f36))
* **data:** return emoji text and display name from the data API ([e48a4d2](https://github.com/ealush/emoji-picker-react/commit/e48a4d276bd4cf501f8d17ce70141c8e1274f456))
* **data:** ship shared emoji search and lookup APIs ([#559](https://github.com/ealush/emoji-picker-react/issues/559)) ([e4d6f9a](https://github.com/ealush/emoji-picker-react/commit/e4d6f9a6ffb973ad4dc3acd22b38e66592260fbf))
* define the v5 release contract and migration ([#566](https://github.com/ealush/emoji-picker-react/issues/566)) ([6617179](https://github.com/ealush/emoji-picker-react/commit/6617179f7e0b58b67e55861398d355a902ce91bf))
* expand controlled picker interactions ([#562](https://github.com/ealush/emoji-picker-react/issues/562)) ([ce8e145](https://github.com/ealush/emoji-picker-react/commit/ce8e145c5475f59cce007e2105704e0c981b91bf))
* harden the picker runtime for v5 ([#557](https://github.com/ealush/emoji-picker-react/issues/557)) ([67f468f](https://github.com/ealush/emoji-picker-react/commit/67f468f9516d0d00c0b8dd38799583b9d9d46b34))
* package consumer integrations and examples ([#563](https://github.com/ealush/emoji-picker-react/issues/563)) ([8fa2b12](https://github.com/ealush/emoji-picker-react/commit/8fa2b128a172e6a3ca404315c0be6da2769b799d))
* publish ES2020 instead of ES2019 ([5ef0a7c](https://github.com/ealush/emoji-picker-react/commit/5ef0a7c8ce25281d17afec92ea16e14f4c19f237))
* redesign the website picker customizer ([#565](https://github.com/ealush/emoji-picker-react/issues/565)) ([c18eafe](https://github.com/ealush/emoji-picker-react/commit/c18eafe2cf731251b682c3cb565854b489ba8eae))
* ship picker-only recipe snippets and implementation prompt ([c3075c0](https://github.com/ealush/emoji-picker-react/commit/c3075c00ede1e54c2914defede6f52f99b169119))

### Bug Fixes

* accept emoji characters in reactions ([ae36cb0](https://github.com/ealush/emoji-picker-react/commit/ae36cb067850ff3a95400fd8e8766a49766f8cbf))
* **examples:** spread the composed path's tabs and drop its double focus ring ([baf8fca](https://github.com/ealush/emoji-picker-react/commit/baf8fca35e4b9b58042f54318c8c9223165991b4))
* finalize the v5 release candidate ([#555](https://github.com/ealush/emoji-picker-react/issues/555)) ([72de6aa](https://github.com/ealush/emoji-picker-react/commit/72de6aa6501f94467ce8f40a93a3366c73e2452d))
* keep background glyph checks from cancelling navigation ([7d0f598](https://github.com/ealush/emoji-picker-react/commit/7d0f598ce25d8f8bf5439c5994df802bc5dd99a3))
* keep category icons tree-shakeable for primitives consumers ([8942f46](https://github.com/ealush/emoji-picker-react/commit/8942f46da9d1287a082082d32447109f94c80209))
* keep columns pickers from widening when the skin tone fan opens ([6e60a8d](https://github.com/ealush/emoji-picker-react/commit/6e60a8da3287c53ac1e8bd0a8283b928b071606d))
* keep picker state while EmojiPicker is closed with `open` ([b50ba84](https://github.com/ealush/emoji-picker-react/commit/b50ba84858db3451b5a5414e46c69480bdedf76e))
* let native glyph refinements keep category jumps in flight ([96998a1](https://github.com/ealush/emoji-picker-react/commit/96998a1c82e2c750c6980046005aaaa8e937121e))
* point storybook docgen at a story-wide typescript project ([ae43590](https://github.com/ealush/emoji-picker-react/commit/ae43590a8076cd1ea4f51a9763b5cd2e2158eecd))
* predict subdivision flags with country flags ([32210a6](https://github.com/ealush/emoji-picker-react/commit/32210a6d9be68078d55a8e30746dc141ed2895f8))
* **primitives:** highlight the destination of useCategoryNavigation jumps ([d2375ae](https://github.com/ealush/emoji-picker-react/commit/d2375ae8d7ee313bdf479f5a98bcb95f9f5121e1))
* publish native glyph results only when they change ([a365407](https://github.com/ealush/emoji-picker-react/commit/a365407995238f4ccb760aed8ad0260f9a774b90))
* **website:** drop the preview caveat from copied prompts after release ([37d2944](https://github.com/ealush/emoji-picker-react/commit/37d2944bc0209def5b100a9226f5282c92050d9a))

### Performance Improvements

* check native glyphs only for cells the grid renders ([e09d921](https://github.com/ealush/emoji-picker-react/commit/e09d921104c2ac49d11101f1a95dbd3929518031))
* check native glyphs only where they are about to be shown ([a7f9e10](https://github.com/ealush/emoji-picker-react/commit/a7f9e10319e44a270784d0d1e7bdb85a1f012632))
* keep development-only warning hooks out of production ([0a5d013](https://github.com/ealush/emoji-picker-react/commit/0a5d0130edabf625594d95a2585ea8a9c30dbb99))
* keep native emoji detection off the first paint ([2654190](https://github.com/ealush/emoji-picker-react/commit/265419087b5306293c91952aa5eab11cad69a483))
* keep virtualized grid geometry and hover navigation stable ([#558](https://github.com/ealush/emoji-picker-react/issues/558)) ([71edad9](https://github.com/ealush/emoji-picker-react/commit/71edad904c62010b5311583a744b43f7d063718a))

## [4.22.3](https://github.com/ealush/emoji-picker-react/compare/4.22.2...4.22.3) (2026-09-28)

## [4.22.2](https://github.com/ealush/emoji-picker-react/compare/4.22.1...4.22.2) (2026-09-12)

### Bug Fixes

* structural config compare and reference-based observer trigger ([#534](https://github.com/ealush/emoji-picker-react/issues/534)) ([6ddbd4e](https://github.com/ealush/emoji-picker-react/commit/6ddbd4e5359f2f23cf8159ad36ddbf322b6235ac))

## [4.22.1](https://github.com/ealush/emoji-picker-react/compare/4.22.0...4.22.1) (2026-09-12)

### Bug Fixes

* reactive group updates, safe group storage, observed categories ([#533](https://github.com/ealush/emoji-picker-react/issues/533)) ([ceda7d2](https://github.com/ealush/emoji-picker-react/commit/ceda7d2c0ebfdd85c739557cb8eee77b90aadee2))

## [4.22.0](https://github.com/ealush/emoji-picker-react/compare/4.21.1...4.22.0) (2026-09-12)

### Features

* group custom emojis into placeable named sections ([#532](https://github.com/ealush/emoji-picker-react/issues/532)) ([ad4cc5e](https://github.com/ealush/emoji-picker-react/commit/ad4cc5e8376c8acd2c2d3c9da7a91d1d070ad1e0))

## [4.21.1](https://github.com/ealush/emoji-picker-react/compare/4.21.0...4.21.1) (2026-09-12)

### Bug Fixes

* never focus partially-below-fold emojis on hover ([#531](https://github.com/ealush/emoji-picker-react/issues/531)) ([9f6b395](https://github.com/ealush/emoji-picker-react/commit/9f6b395ed82983934e5022b3a9e15bf276e8a678))

## [4.21.0](https://github.com/ealush/emoji-picker-react/compare/4.20.9...4.21.0) (2026-09-12)

### Features

* recolorable category navigation icons via CSS variables ([#399](https://github.com/ealush/emoji-picker-react/issues/399)) ([#530](https://github.com/ealush/emoji-picker-react/issues/530)) ([3108e7b](https://github.com/ealush/emoji-picker-react/commit/3108e7b120ed8a4b1c7ec21015d7ef2a621e3839))

## [4.20.9](https://github.com/ealush/emoji-picker-react/compare/4.20.8...4.20.9) (2026-09-12)

### Bug Fixes

* hide category navigation when only one category is visible ([#396](https://github.com/ealush/emoji-picker-react/issues/396)) ([#529](https://github.com/ealush/emoji-picker-react/issues/529)) ([673c5a1](https://github.com/ealush/emoji-picker-react/commit/673c5a143ade7d18274e728ed3836083bd3eb8fd))

## [4.20.8](https://github.com/ealush/emoji-picker-react/compare/4.20.7...4.20.8) (2026-09-12)

### Bug Fixes

* keep external focus when hovering emojis ([#320](https://github.com/ealush/emoji-picker-react/issues/320)) ([#527](https://github.com/ealush/emoji-picker-react/issues/527)) ([ac11985](https://github.com/ealush/emoji-picker-react/commit/ac119853cfbffd821064eeb2034cb0303f587d8f))

## [4.20.7](https://github.com/ealush/emoji-picker-react/compare/4.20.6...4.20.7) (2026-09-09)

### Bug Fixes

* keep translated emojiData after space bar preview ([#503](https://github.com/ealush/emoji-picker-react/issues/503)) ([#526](https://github.com/ealush/emoji-picker-react/issues/526)) ([21597b8](https://github.com/ealush/emoji-picker-react/commit/21597b83cf325971db75ed08e06af03244465fcd))

## [4.20.6](https://github.com/ealush/emoji-picker-react/compare/4.20.5...4.20.6) (2026-09-09)

### Bug Fixes

* paint first category without waiting for visibility observer ([#525](https://github.com/ealush/emoji-picker-react/issues/525)) ([bf45ea0](https://github.com/ealush/emoji-picker-react/commit/bf45ea05da20f85b93cf3617cddcc4d3266cb971))

## [4.20.5](https://github.com/ealush/emoji-picker-react/compare/4.20.4...4.20.5) (2026-09-09)

### Bug Fixes

* resolve a11y and keyboard navigation issue cluster ([#522](https://github.com/ealush/emoji-picker-react/issues/522)) ([e180b10](https://github.com/ealush/emoji-picker-react/commit/e180b10388bfe748717a802e8293b4dc961a532c))

## [4.20.4](https://github.com/ealush/emoji-picker-react/compare/4.20.3...4.20.4) (2026-09-09)

### Bug Fixes

* transpile shipstyles instead of flairup in storybook build ([#521](https://github.com/ealush/emoji-picker-react/issues/521)) ([cecf3a0](https://github.com/ealush/emoji-picker-react/commit/cecf3a037f2b0cd4bc7367812a73917f1060fef8))
