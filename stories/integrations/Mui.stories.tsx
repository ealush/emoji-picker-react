import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import type { Meta } from '@storybook/react-vite';
import React, { useState } from 'react';

import EmojiPicker, { EmojiClickData } from '../../src';

const meta = {
  title: 'Integrations/MUI',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

const muiTheme = createTheme({
  palette: { primary: { main: '#1565c0' } },
  shape: { borderRadius: 8 },
});

// MUI's styled() maps the MUI theme onto picker tokens; the picker drops
// its own chrome (`unstyled`) and sits inside an MUI Popover/Paper.
const MuiEmojiPicker = styled(EmojiPicker)(({ theme }) => ({
  '--epr-bg-color': theme.palette.background.paper,
  '--epr-text-color': theme.palette.text.secondary,
  '--epr-highlight-color': theme.palette.primary.main,
  '--epr-hover-bg-color': theme.palette.action.hover,
  '--epr-focus-bg-color': theme.palette.action.selected,
  '--epr-search-input-bg-color': theme.palette.background.paper,
  '--epr-search-border-color': theme.palette.divider,
  '--epr-search-border-color-active': theme.palette.primary.main,
  '--epr-search-input-border-radius': `${theme.shape.borderRadius}px`,
  '--epr-search-input-text-color': theme.palette.text.primary,
  '--epr-search-input-placeholder-color': theme.palette.text.secondary,
  '--epr-category-label-bg-color': theme.palette.background.paper,
  '--epr-category-label-text-color': theme.palette.text.secondary,
  '--epr-category-icon-active-color': theme.palette.primary.main,
  '--epr-category-icon-inactive-color': theme.palette.text.secondary,
  '--epr-preview-text-color': theme.palette.text.primary,
  '--epr-preview-border-color': theme.palette.divider,
  fontFamily: theme.typography.fontFamily,
  '& [data-epr-part="category-label"]': {
    ...theme.typography.overline,
    lineHeight: 'var(--epr-category-label-height)',
  },
}));

export function Mui() {
  // Anchor held in state: the Popover opens on first render, before a ref
  // object would be populated.
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('Great work team ');
  return (
    <ThemeProvider theme={muiTheme}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ width: 420, height: 520, alignItems: 'flex-start' }}
      >
        <TextField
          size="small"
          label="Comment"
          value={text}
          onChange={(event) => setText(event.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          ref={setAnchor}
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ height: 40 }}
        >
          Emoji
        </Button>
        <Popover
          open={open && anchor !== null}
          anchorEl={anchor}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          disablePortal
          slotProps={{ paper: { component: Paper, elevation: 8 } }}
        >
          <MuiEmojiPicker
            unstyled
            width={340}
            height={420}
            onEmojiClick={(emoji: EmojiClickData) => setText((t) => t + emoji.emoji)}
          />
        </Popover>
      </Stack>
    </ThemeProvider>
  );
}
