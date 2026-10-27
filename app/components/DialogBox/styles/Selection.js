export const styles = (theme) => ({
  root: {},
  selectedAvatar: {
    background: theme.palette.secondary.main,
  },
  // on-colour of the avatar: white was nearly invisible on the light
  // primary of the dark scheme
  selectedIcon: {
    color: theme.palette.secondary.contrastText,
  },
});
