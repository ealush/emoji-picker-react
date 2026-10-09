import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import * as Picker from '../../src/primitives';

// TextField's ref is its wrapper. Route the picker ref and native input
// attributes through htmlInput; keep TextField's controlled state in sync.
export const MuiSearchInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    variant: 'outlined' | 'filled';
  }
>(function MuiSearchInput(
  { variant, value, onChange, disabled, autoFocus, placeholder, ...inputProps },
  ref,
) {
  return (
    <TextField
      variant={variant}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus={autoFocus}
      placeholder={placeholder}
      size="small"
      fullWidth
      inputRef={ref}
      slotProps={{ htmlInput: inputProps }}
    />
  );
});

const components: Picker.ListComponents = {
  Emoji: ({ emoji, ...props }) => (
    <Button
      {...props}
      color="primary"
      variant="outlined"
      sx={{
        minWidth: 0,
        padding: 0,
        borderWidth: 2,
        borderRadius: 1,
        backgroundColor: emoji.isActive ? 'action.selected' : 'transparent',
        '&:focus-visible': { outline: '2px solid #1565c0', outlineOffset: -2 },
      }}
    />
  ),
  CategoryHeader: ({ category: _category, ...props }) => (
    <Typography
      {...props}
      component="div"
      variant="overline"
      sx={{ backgroundColor: 'background.paper', color: 'text.secondary' }}
    />
  ),
};

const theme = createTheme({ palette: { primary: { main: '#1565c0' } } });

export function MuiComposition() {
  const [selected, setSelected] = React.useState('');
  return (
    <ThemeProvider theme={theme}>
      <Paper sx={{ padding: 2, width: 352 }}>
        <Picker.Root
          colorScheme="light"
          aria-label="Choose an emoji"
          style={{ width: 320, height: 400 }}
          onEmojiClick={(emoji) => setSelected(emoji.emoji)}
        >
          <Picker.Panel style={{ gap: 8 }}>
            <Picker.SearchInput as={MuiSearchInput} variant="outlined" />
            <Picker.Viewport>
              <Picker.List components={components} />
              <Picker.Empty />
              <Picker.Loading />
              <Picker.LoadError />
            </Picker.Viewport>
          </Picker.Panel>
        </Picker.Root>
        <Typography role="status" aria-label="Selected emoji" sx={{ mt: 1 }}>
          {selected || 'Choose an emoji to insert'}
        </Typography>
      </Paper>
    </ThemeProvider>
  );
}

// Shared native-button adapters work in the grid, variation menu and reactions.
const controlComponents: Picker.PickerComponents = {
  ...components,
  CategoryButton: ({ category, ...props }) => (
    <Button
      {...props}
      color="primary"
      variant={category.isActive ? 'contained' : 'text'}
      sx={{ minWidth: 0, padding: 0 }}
    />
  ),
  SkinToneButton: ({ tone: _tone, ...props }) => (
    <Button
      {...props}
      color="primary"
      sx={{ minWidth: 0, padding: 0, lineHeight: 1, fontSize: 14 }}
    />
  ),
  ExpandButton: (props) => (
    <Button {...props} color="primary" sx={{ minWidth: 32 }} />
  ),
};

function MuiActions() {
  const { clear } = Picker.useSearchActions();
  const { collapse } = Picker.usePickerMode();
  const active = Picker.useActiveEmoji();
  return (
    <>
      <Button onClick={clear}>Clear search</Button>
      <Button onClick={collapse}>Show reactions</Button>
      <Typography aria-label="Active emoji" sx={{ minHeight: 24 }}>
        {active ? active.names[active.names.length - 1] : 'Browse emojis'}
      </Typography>
    </>
  );
}

export function MuiControls() {
  const [selected, setSelected] = React.useState('');
  return (
    <ThemeProvider theme={theme}>
      <Paper sx={{ padding: 2, width: 384 }}>
        <Picker.Root
          components={controlComponents}
          style={{ width: 352, height: 460 }}
          categories={[
            Picker.Categories.SMILEYS_PEOPLE,
            Picker.Categories.ANIMALS_NATURE,
          ]}
          reactions={['1f600', '1f44d', '1f431']}
          reactionsDefaultOpen
          onEmojiClick={(emoji) => setSelected(emoji.emoji)}
          onReactionClick={(emoji) => setSelected(emoji.emoji)}
        >
          <Picker.Reactions style={{ height: 48, flex: 'none' }} />
          <Picker.Panel style={{ gap: 8 }}>
            <Picker.SearchInput as={MuiSearchInput} variant="outlined" />
            <Picker.CategoryNav />
            <Picker.SkinTone />
            <Picker.Viewport>
              <Picker.List />
              <Picker.Empty />
              <Picker.Loading />
              <Picker.LoadError />
            </Picker.Viewport>
            <MuiActions />
          </Picker.Panel>
        </Picker.Root>
        <Typography role="status" aria-label="Selected emoji">
          {selected || 'Choose an emoji'}
        </Typography>
      </Paper>
    </ThemeProvider>
  );
}
