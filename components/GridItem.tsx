import React from 'react';
import { motion } from 'framer-motion';
import { GameItem } from '../types';
import { ICON_MAP } from '../constants';

interface Props {
  item: GameItem;
  onClick?: (item: GameItem) => void;
  disabled?: boolean;
  sizeClass: string;
}

const GridItem: React.FC<Props> = ({ item, onClick, disabled, sizeClass }) => {
  const IconComponent = ICON_MAP[item.iconName];

  return (
    <motion.button
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => !disabled && onClick && onClick(item)}
      className={`
        flex items-center justify-center 
        aspect-square rounded-xl 
        shadow-sm backdrop-blur-sm bg-white/10
        hover:bg-white/20 transition-colors
        ${item.color}
      `}
    >
      {IconComponent && <IconComponent className={sizeClass} strokeWidth={2.5} />}
    </motion.button>
  );
};

export default React.memo(GridItem);
