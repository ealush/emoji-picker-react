import * as React from 'react';
import { describe, expect, it } from 'vitest';
import * as Picker from '../../src/primitives';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    variant: 'quiet' | 'outlined';
  }
>(({ variant, ...props }, ref) => (
  <input {...props} ref={ref} data-variant={variant} />
));
const ref = React.createRef<HTMLInputElement>();
const native = <Picker.SearchInput ref={ref} readOnly />;
const custom = <Picker.SearchInput as={Input} ref={ref} variant="quiet" />;
const SizedInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size: 'sm' | 'lg';
  }
>(({ size, ...props }, inputRef) => (
  <input {...props} ref={inputRef} data-size={size} />
));
const sized = <Picker.SearchInput as={SizedInput} size="sm" />;
// @ts-expect-error Design-library size options replace native numeric size.
const numericSize = <Picker.SearchInput as={SizedInput} size={2} />;
// @ts-expect-error The design-library size stays required.
const missingSize = <Picker.SearchInput as={SizedInput} />;
// @ts-expect-error Input's required design-library props stay required.
const missingVariant = <Picker.SearchInput as={Input} />;
// @ts-expect-error Invalid design-library option.
const invalidVariant = <Picker.SearchInput as={Input} variant="solid" />;
// @ts-expect-error Root owns the input value.
const value = <Picker.SearchInput as={Input} variant="quiet" value="face" />;
// @ts-expect-error SearchInput requires a native input or input-forwarding component.
const textarea = <Picker.SearchInput as="textarea" />;
// @ts-expect-error A native input has no variant prop.
const invented = <Picker.SearchInput variant="quiet" />;
const root = (
  // @ts-expect-error Managed markup cannot be replaced.
  <Picker.Root dangerouslySetInnerHTML={{ __html: '' }}>content</Picker.Root>
);
const viewport = (
  // @ts-expect-error Managed markup cannot be replaced.
  <Picker.Viewport dangerouslySetInnerHTML={{ __html: '' }}>
    content
  </Picker.Viewport>
);
// @ts-expect-error Managed markup cannot be replaced.
const list = <Picker.List dangerouslySetInnerHTML={{ __html: '' }} />;
void native;
void custom;
void sized;
void numericSize;
void missingSize;
void missingVariant;
void invalidVariant;
void value;
void textarea;
void invented;
void root;
void viewport;
void list;

describe('BYOD input type contract', () => {
  it('exports the composition with its React ref', () =>
    expect(custom.props.ref).toBe(ref));
});
