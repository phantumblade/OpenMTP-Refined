import React from 'react';
import { StarRounded as StarRoundedIcon } from './m3/symbolIcons';

// Yellow star shown next to folders pinned to the sidebar favourites.
const FAVORITE_STAR_COLOR = '#F5B400';

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
