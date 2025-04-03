import { alpha } from '@mui/material/styles';

export const globalStyles = {
  tableRow: {
    '&:nth-of-type(odd)': { backgroundColor: alpha('#000', 0.02) },
    '&:hover': { backgroundColor: alpha('#000', 0.04) }
  },
  tableHeader: {
    fontWeight: 600,
    backgroundColor: 'primary.main',
    color: 'white',
  },
  tableCell: {
    width: '100px',
    fontWeight: 600,
    backgroundColor: 'primary.main',
    color: 'white',
  },
  tableTitle: {
    color: 'primary.main',
    fontWeight: 600,
  },
  tableSubtitle: {
    color: 'text.secondary',
  },
  actionButton: {
    color: 'primary.main',
    '&:hover': { backgroundColor: alpha('#000', 0.1) }
  },
  newRow: {
    backgroundColor: alpha('#000', 0.05)
  }
};