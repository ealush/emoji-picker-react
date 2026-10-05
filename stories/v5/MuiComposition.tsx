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
          panelProps={{ style: { gap: 8 } }}
          onEmojiClick={(emoji) => setSelected(emoji.emoji)}
        >
          <Picker.SearchInput as={MuiSearchInput} variant="outlined" />
          <Picker.Viewport>
            <Picker.List components={components} />
            <Picker.Empty />
            <Picker.Loading />
            <Picker.LoadError />
          </Picker.Viewport>
        </Picker.Root>
        <Typography role="status" aria-label="Selected emoji" sx={{ mt: 1 }}>
          {selected || 'Choose an emoji to insert'}
        </Typography>
      </Paper>
    </ThemeProvider>
  );
}
