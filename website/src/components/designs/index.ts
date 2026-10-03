import { Shell as ArticleComments } from './ArticleComments';
import { Shell as CommunityForum } from './CommunityForum';
import { Shell as EditorInsertPanel } from './EditorInsertPanel';
import { Shell as HabitTrackerMobile } from './HabitTrackerMobile';
import { Shell as LivestreamChat } from './LivestreamChat';
import { Shell as ProjectIconPicker } from './ProjectIconPicker';
import { Shell as ShortcodeTypeahead } from './ShortcodeTypeahead';
import { Shell as StatusDialog } from './StatusDialog';
import { Shell as TeamChat } from './TeamChat';
import { Shell as VideoCallReactions } from './VideoCallReactions';

export const DESIGN_EXAMPLES = [
  { id: 'team-chat', description: "A popover above a chat composer: search with skin tone, tabs, grid and a slim preview.", title: "Team chat composer", rootClass: 'chat-picker', Example: TeamChat },
  { id: 'article-comments', description: "Reaction count chips plus a compact reactions bar that expands to the full picker.", title: "Article comments", rootClass: 'comments-picker', Example: ArticleComments },
  { id: 'editor-insert-panel', description: "A side-by-side panel: vertical rail, grid and a details pane via useActiveEmoji().", title: "Doc editor insert panel", rootClass: 'editor-picker', Example: EditorInsertPanel },
  { id: 'livestream-chat', description: "Docked under a dark chat column: tabs on top and a dense grid.", title: "Livestream chat", rootClass: 'stream-picker', Example: LivestreamChat },
  { id: 'status-dialog', description: "An inline form section with status-friendly suggestions and renamed categories.", title: "Set a status dialog", rootClass: 'status-picker', Example: StatusDialog },
  { id: 'shortcode-typeahead', description: "A `:shortcode` autocomplete: the app's own text drives searchValue, no search box.", title: "Shortcode typeahead", rootClass: 'typeahead-picker', Example: ShortcodeTypeahead },
  { id: 'video-call-reactions', description: "A translucent reactions pill over video that expands to a dark picker.", title: "Video call reactions", rootClass: 'call-picker', Example: VideoCallReactions },
  { id: 'community-forum', description: "Community custom emojis as their own group, before the standard set.", title: "Community custom emojis", rootClass: 'forum-picker', Example: CommunityForum },
  { id: 'project-icon-picker', description: "A settings form: picking sets the project icon; categories are narrowed.", title: "Project icon picker", rootClass: 'project-picker', Example: ProjectIconPicker },
  { id: 'habit-tracker-mobile', description: "A mobile bottom sheet with large, tile-style emojis.", title: "Habit tracker (mobile)", rootClass: 'habit-picker', Example: HabitTrackerMobile },
];
