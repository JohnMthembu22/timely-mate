/** MUI Tabs + TabPanel accessibility — Tab `id` must match TabPanel `aria-labelledby`. */
export function tabA11yProps(index: number, prefix: string) {
  return {
    id: `${prefix}-tab-${index}`,
    'aria-controls': `${prefix}-tabpanel-${index}`,
  };
}

export function tabPanelA11yProps(index: number, prefix: string) {
  return {
    id: `${prefix}-tabpanel-${index}`,
    'aria-labelledby': `${prefix}-tab-${index}`,
  };
}
