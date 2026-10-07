import React from 'react';
import { StarRounded as StarRoundedIcon } from './m3/symbolIcons';

// Star shown next to folders pinned to the sidebar favourites, in the M3
// tertiary role (the icon's orange) like the favourites in the sidebar.
const FAVORITE_STAR_COLOR = 'var(--md-sys-color-tertiary)';

export default function FavoriteStar({ size = 15, style = {} }) {
  return (
    <StarRoundedIcon
      aria-hidden="true"
      data-favorite-star="true"
      style={{
        color: FAVORITE_STAR_COLOR,
        fontSize: size,
        flexShrink: 0,
        verticalAlign: 'text-bottom',
        ...style,
      }}
    />
  );
}
