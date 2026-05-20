import React from 'react';
import { Box, Paper, PaperProps } from '@mui/material';
import { popupAccentBarSx, popupHoverCardPaperSx } from '../../theme/popupSurfaces';

export interface PopupHoverCardProps extends Omit<PaperProps, 'elevation'> {
  children: React.ReactNode;
  showAccentBar?: boolean;
}

/** Anchored hover preview card — uses global popup surface tokens */
export const PopupHoverCard: React.FC<PopupHoverCardProps> = ({
  children,
  showAccentBar = true,
  sx,
  ...paperProps
}) => (
  <Paper elevation={0} sx={{ ...popupHoverCardPaperSx, ...sx }} {...paperProps}>
    {showAccentBar && <Box sx={popupAccentBarSx} />}
    {children}
  </Paper>
);

export default PopupHoverCard;
