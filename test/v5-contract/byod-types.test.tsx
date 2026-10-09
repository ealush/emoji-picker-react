import * as React from 'react';
import { render, screen } from '@testing-library/react';
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
  <Picker.Root dangerouslySetInnerHTML={{ __html: '' }}>
    <Picker.Reactions />
    <Picker.Panel>content</Picker.Panel>
  </Picker.Root>
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
  it('forwards a design-library input ref to its native input', () => {
    render(
      <Picker.Root emojiData={{ categories: {}, emojis: {} }}>
        <Picker.Reactions />
        <Picker.Panel>{custom}</Picker.Panel>
      </Picker.Root>,
    );
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });
});

const slots: Picker.PickerComponents = {
  CategoryButton: ({ category, ...props }) => (
    <button {...props} data-active={category.isActive} />
  ),
  SkinToneButton: ({ tone, ...props }) => (
    <button {...props} data-open={tone.isOpen} />
  ),
  ExpandButton: (props) => <button {...props} />,
  ClearButton: (props) => <button {...props} />,
};
const explicit = (
  <Picker.Root appearance="none" components={slots}>
    <Picker.Reactions ref={React.createRef<HTMLUListElement>()} />
    <Picker.Panel ref={React.createRef<HTMLDivElement>()}>
      <Picker.SearchInput />
    </Picker.Panel>
  </Picker.Root>
);
// @ts-expect-error Panel's required hidden presence is managed.
const hiddenPanel = <Picker.Panel hidden />;
const reactionChildren = (
  // @ts-expect-error Reactions owns its managed children.
  <Picker.Reactions>
    <button />
  </Picker.Reactions>
);
// @ts-expect-error Component maps do not accept invented slots.
const invalidSlots: Picker.PickerComponents = { Item: () => <button /> };
const invalidAppearance = (
  // @ts-expect-error Appearance is a closed contract.
  <Picker.Root appearance="unstyled">
    <Picker.Reactions />
    <Picker.Panel>content</Picker.Panel>
  </Picker.Root>
);
void explicit;
void hiddenPanel;
void reactionChildren;
void invalidSlots;
void invalidAppearance;
