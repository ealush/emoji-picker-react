import * as React from 'react';

// Default navigation icons, extracted from the former CategoryNav.svg
// sprite (row 0). Paint uses currentColor so the fill follows the
// --epr-category-icon-*-color variables.
// https://github.com/ealush/emoji-picker-react/issues/399

const COLUMNS: Record<string, number> = {
  smileys_people: 0,
  animals_nature: 1,
  food_drink: 2,
  travel_places: 3,
  activities: 4,
  objects: 5,
  symbols: 6,
  flags: 7,
  suggested: 8,
  custom: 9,
};

const SHAPES: Record<number, React.ReactNode> = {
  0: (
    <>
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.1"
        strokeMiterlimit="10"
        d="M12.8,9.5c0.6,0,1.1-0.5,1.1-1.2
		c0-0.6-0.5-1.1-1.1-1.1c-0.6,0-1.2,0.5-1.2,1.1S12.2,9.5,12.8,9.5z M12.8,7.9c0.2,0,0.4,0.2,0.4,0.4c0,0.2-0.2,0.4-0.4,0.4
		c-0.2,0-0.4-0.2-0.4-0.4C12.4,8.1,12.6,7.9,12.8,7.9z"
      />
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.1"
        strokeMiterlimit="10"
        d="M7.2,9.5c0.6,0,1.2-0.5,1.2-1.2
		c0-0.6-0.5-1.1-1.2-1.1c-0.6,0-1.1,0.5-1.1,1.1S6.6,9.5,7.2,9.5z M7.2,7.9c0.2,0,0.4,0.2,0.4,0.4c0,0.2-0.2,0.4-0.4,0.4
		C7,8.7,6.8,8.5,6.8,8.3C6.8,8.1,7,7.9,7.2,7.9z"
      />
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.1"
        strokeMiterlimit="10"
        d="M14.6,11.2c-0.1-0.1-0.2-0.2-0.3-0.2H5.7
		c-0.1,0-0.2,0.1-0.3,0.2c-0.1,0.1-0.1,0.2,0,0.4c0.7,2,2.5,3.3,4.6,3.3s3.9-1.3,4.6-3.3C14.7,11.4,14.7,11.3,14.6,11.2z M10,14.1
		c-1.6,0-3-0.9-3.7-2.2h7.3C13,13.2,11.6,14.1,10,14.1z"
      />
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.1"
        strokeMiterlimit="10"
        d="M10,3c-3.8,0-7,3.1-7,7s3.1,7,7,7s7-3.1,7-7
		S13.8,3,10,3z M10,16.2c-3.4,0-6.2-2.8-6.2-6.2S6.6,3.8,10,3.8s6.2,2.8,6.2,6.2S13.4,16.2,10,16.2z"
      />
    </>
  ),
  1: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        d="M24.2,11V3.5c0.1,0.1,0.8,0.9,2.8,3.1c2.5-1.7,5.6-0.7,6.9,0l2.4-3.1v7.1
			c0,1.2-0.1,2.5-0.9,3.4c-1,1.2-2.7,2.5-5.3,2.5c-2.9,0-4.5-1.5-5.3-2.9C24.2,12.9,24.2,11.9,24.2,11z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M21.2,10l5.4,1.2"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M21.2,14.1l5.4-1.2"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M38.8,10l-5.4,1.2"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M38.8,14.1l-5.4-1.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M29.5,12.4L29,11.7c-0.2-0.3,0-0.6,0.3-0.6h1.4
			c0.3,0,0.5,0.4,0.3,0.6l-0.7,1l0,0c-0.7,1.2-2.6,1.1-3.1-0.3l-0.1-0.2c-0.1-0.2,0-0.4,0.2-0.5s0.4,0,0.5,0.2l0.1,0.2
			C28.3,12.7,29.1,12.9,29.5,12.4z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M32.4,12.1l-0.1,0.2c-0.4,1-1.8,1.1-2.3,0.2"
      />
      <ellipse fill="currentColor" cx="27.6" cy="9.7" rx="0.7" ry="0.7" />
      <ellipse fill="currentColor" cx="32.4" cy="9.7" rx="0.7" ry="0.7" />
    </>
  ),
  2: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        d="M48.1,3.5h3.7c2.5,0,4.5,2,4.5,4.5c0,0.5-0.4,0.9-0.9,0.9H44.5c-0.5,0-0.9-0.4-0.9-0.9
				C43.6,5.5,45.6,3.5,48.1,3.5z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M43.5,8.7c-0.2,0.1-0.5,1.2,0,1.5c1.4,0.9,8.5,0.8,11.3,0.6
				c0.8-0.1,1.6-0.4,1.7-1.2c0-0.3-0.1-0.6-0.6-0.9"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M43.5,10.6L43.3,11c-0.2,0.5,0.2,1,0.7,0.9
				c0.3-0.1,0.5,0.1,0.7,0.3l0.1,0.2c0.3,0.5,1,0.6,1.5,0.2l0,0c0.3-0.2,0.7-0.3,1-0.2l0.8,0.3c0.4,0.1,0.8,0.1,1.2,0l0.5-0.2
				c0.4-0.2,0.9-0.2,1.3,0l0.5,0.2c0.4,0.2,0.8,0.1,1.2-0.1l0.2-0.1c0.3-0.2,0.8-0.1,1.1,0.1l0.2,0.2c0.3,0.3,0.8,0.2,1-0.2l0.1-0.2
				c0.1-0.2,0-0.3,0.2-0.4c0.5,0,1.2-0.3,1.1-0.7l-0.4-1.1"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M43.5,12.1c-0.1,0.2-0.3,0.8,0,1.1c0.3,0.4,3,1.1,6.4,1.1
				c2.2,0,4.6-0.3,6-0.6c0.5-0.1,0.9-0.4,0.8-0.9c0-0.2-0.2-0.5-0.4-0.7"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M43.5,13.3c0,0.5,0.6,2.4,1.3,2.6c1.8,0.8,5.7,0.7,8.1,0.5
				c1.3-0.1,2.5-0.7,3.2-1.8c0.3-0.5,0.5-1,0.5-1.4"
      />
      <ellipse fill="currentColor" cx="51.6" cy="6.5" rx="0.3" ry="0.4" />
      <ellipse fill="currentColor" cx="53" cy="4.9" rx="0.3" ry="0.4" />
      <ellipse fill="currentColor" cx="53" cy="7.2" rx="0.3" ry="0.4" />
      <ellipse fill="currentColor" cx="54.3" cy="6.5" rx="0.3" ry="0.4" />
      <ellipse fill="currentColor" cx="50.9" cy="4.9" rx="0.3" ry="0.4" />
    </>
  ),
  3: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        d="M64.1,13.4l2.3,0c0.2,0,0.4,0.2,0.4,0.4v2.1c0,0.2-0.2,0.4-0.4,0.4h-2.3
				c-0.2,0-0.4-0.2-0.4-0.4v-2.1C63.7,13.6,63.8,13.4,64.1,13.4z"
      />
      <path
        fill="none"
        stroke="currentColor"
        d="M73.5,13.4h2.4c0.2,0,0.4,0.2,0.4,0.4v2.1c0,0.2-0.2,0.4-0.4,0.4h-2.4
				c-0.2,0-0.4-0.2-0.4-0.4l0-2.1C73.1,13.6,73.3,13.4,73.5,13.4z"
      />
      <path fill="none" stroke="currentColor" d="M63.7,8.4h12.6v5H63.7V8.4z" />
      <path
        fill="none"
        stroke="currentColor"
        d="M65.5,3.6h8.9c1,0,1.9,0.8,1.9,1.9v3.1H63.7V5.5C63.7,4.4,64.5,3.6,65.5,3.6z"
      />
      <ellipse fill="currentColor" cx="66.2" cy="10.9" rx="0.9" ry="0.9" />
      <ellipse fill="currentColor" cx="73.8" cy="10.9" rx="0.9" ry="0.9" />
    </>
  ),
  4: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        d="M96.4,10c0,3.6-2.9,6.5-6.4,6.5s-6.4-2.9-6.4-6.5s2.9-6.5,6.4-6.5S96.4,6.4,96.4,10z"
      />
      <path
        fill="none"
        stroke="currentColor"
        d="M96.3,8.6c0,0,0,0.1,0,0.1c-0.9,0.1-2.9,0.1-4.6-1.2c-1.1-0.8-2-1.7-2.6-2.5
				c-0.3-0.4-0.6-0.8-0.7-1.1c-0.1-0.1-0.1-0.2-0.1-0.2c0.5-0.1,1.2-0.2,2-0.2c1.2,0,2.5,0.3,3.5,1.1c1,0.8,1.7,1.8,2.1,2.8
				C96.1,7.9,96.2,8.3,96.3,8.6z"
      />
      <path
        fill="none"
        stroke="currentColor"
        d="M84,12.1c0,0,0-0.1,0-0.1c0.9-0.2,2.9-0.4,4.7,0.6c1.1,0.6,1.9,1.5,2.4,2.3
				c0.4,0.5,0.6,1,0.7,1.3c-0.4,0.1-1,0.2-1.7,0.3c-1,0-2.1-0.1-3.2-0.8c-1.1-0.6-1.9-1.6-2.4-2.5C84.2,12.8,84.1,12.4,84,12.1z"
      />
    </>
  ),
  5: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M116.3,6.8l-1.4,2L114.1,8l-0.6-0.7l0,0.9l-0.1,8.2h-6.8l-0.1-8.2
				l0-0.9L105.9,8l-0.8,0.8l-1.4-2l2.6-2.9c0.1-0.1,0.2-0.1,0.3-0.1h1.3l0.4,0.7c0.7,1.3,2.6,1.3,3.3-0.1l0.3-0.6h1.2
				c0.1,0,0.2,0,0.3,0.1l0.3-0.3l-0.3,0.3L116.3,6.8z"
      />
      <path
        fill="none"
        stroke="currentColor"
        d="M110.1,7.7h2v0.9c0,0.4-0.4,0.7-1,0.7c-0.6,0-1-0.3-1-0.7L110.1,7.7L110.1,7.7z"
      />
    </>
  ),
  6: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        d="M126.8,14.3c0,1.2-1,2.2-2.2,2.2s-2.2-1-2.2-2.2s1-2.2,2.2-2.2S126.8,13.1,126.8,14.3z"
      />
      <path
        fill="none"
        stroke="currentColor"
        d="M137.6,14.3c0,1.2-1,2.2-2.2,2.2c-1.2,0-2.2-1-2.2-2.2s1-2.2,2.2-2.2
				C136.6,12.1,137.6,13.1,137.6,14.3z"
      />
      <path fill="none" stroke="currentColor" d="M126.8,4.4v9.9" />
      <path fill="none" stroke="currentColor" d="M137.7,4.4v9.9" />
      <path
        fill="none"
        stroke="currentColor"
        d="M126.8,3.5h10.8v2.7h-10.8C126.8,6.2,126.8,3.5,126.8,3.5z"
      />
    </>
  ),
  7: (
    <>
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.25"
        strokeMiterlimit="10"
        d="M156,4.3c-0.2-0.1-0.4-0.1-0.5,0
	c0,0-0.2,0.1-0.9,0.1c-0.7,0-2.4-0.1-3.8-0.6c-0.8-0.3-1.7-0.5-2.5-0.5c-0.2,0-0.4,0-0.5,0c-1.3,0-2.5,0.3-3.6,1
	c-0.2,0.1-0.2,0.2-0.2,0.4v11.6c0,0.3,0.1,0.5,0.3,0.5c0.6,0,0.5-0.4,0.5-0.6v-5.7c0.7-0.3,3.2-1.1,5.8-0.1c1.6,0.6,3.5,0.7,4.3,0.7
	c0.8,0,1.3-0.3,1.3-0.3c0.2-0.1,0.3-0.2,0.3-0.4V4.7C156.2,4.5,156.1,4.4,156,4.3z M155.6,10.2c-0.1,0-0.7,0.1-1,0.1
	c-0.7,0-2.4-0.1-3.8-0.6c-2.5-1-5-0.5-6.2-0.1V4.7c0.9-0.5,2.2-0.7,3.2-0.7c0.1,0,0.3,0,0.4,0c0.7,0,1.5,0.2,2.2,0.4
	c1.6,0.6,3.5,0.7,4.3,0.7c0.2,0,0.8,0,1-0.1V10.2z"
      />
    </>
  ),
  8: (
    <>
      <path
        fill="currentColor"
        d="M170.8,3.1L170.8,3.1c-0.3,0-0.5,0-0.8,0c-2.1,0-4,1-5.3,2.5l-0.1,0l-0.1-0.1l-1-1.2l-0.3,3.4l3.4,0.3
				l-1.1-1.3l-0.1-0.1l0.1-0.1c1.1-1.4,3-2.3,5-2.1l0,0c3.2,0.3,5.5,3.1,5.2,6.3c-0.3,3-3.1,5.3-6.1,5.1c-3.1-0.2-5.4-2.9-5.3-6
				L163,9.5c-0.2,3.8,2.6,7.1,6.3,7.4c3.9,0.4,7.3-2.6,7.6-6.5C177.2,6.8,174.4,3.5,170.8,3.1z"
      />
      <path
        fill="currentColor"
        d="M170.3,7.4c0-0.3-0.3-0.6-0.6-0.6S169,7.1,169,7.4v3.2c0,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.3,0.2,0.4,0.2
				h2.4c0.4,0,0.6-0.3,0.6-0.6s-0.3-0.6-0.6-0.6h-1.6h-0.2V9.8L170.3,7.4L170.3,7.4z"
      />
    </>
  ),
  9: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        d="M186.2,3.4h7.7c1.5,0,2.7,1.2,2.7,2.7v7.7c0,1.5-1.2,2.7-2.7,2.7h-7.7
				c-1.5,0-2.7-1.2-2.7-2.7V6.1C183.4,4.6,184.7,3.4,186.2,3.4z"
      />
      <ellipse fill="currentColor" cx="186" cy="8.9" rx="0.7" ry="0.7" />
      <ellipse fill="currentColor" cx="194" cy="6.7" rx="0.7" ry="0.7" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        d="M186,13.3l0.4-0.3c0.4-0.3,1-0.3,1.5-0.1l1,0.4
				c0.5,0.2,1,0.2,1.5-0.1l0.8-0.5c0.4-0.3,1-0.3,1.5-0.1l1.8,0.8"
      />
    </>
  ),
};

export function CategoryNavIcon({ category }: { category: string }) {
  const column = COLUMNS[category] ?? 0;
  return (
    <svg
      viewBox={`${column * 20} 0 20 20`}
      width="100%"
      height="100%"
      // Absolutely positioned over the button's padding box, matching the
      // geometry of the former background-image sprite. Percentage sizes
      // alone would resolve against the smaller content box (the button
      // reset carries padding), shrinking the glyph.
      style={{
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    >
      {SHAPES[column] ?? null}
    </svg>
  );
}
