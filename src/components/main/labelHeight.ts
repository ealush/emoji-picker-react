// Shared label-height fallback (pixels). Lives in its own side-effect-free
// module so measurement code in the primitives closure never imports the
// default-appearance stylesheet (which would drag branded CSS into the
// primitives bundle).
export const DEFAULT_LABEL_HEIGHT = 40;
