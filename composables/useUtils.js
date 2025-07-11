import { useAdminOverview } from './useAdminOverview';

export function useUtils() {
  const { getTableIcon } = useAdminOverview();

  const formatColumnName = (name) => {
    if (!name) return '';
    return name.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isDateColumn = (column) => {
    return column.name.includes('_at') || column.name.includes('date') || column.name.includes('expires');
  };

  const isBooleanColumn = (column) => {
    // Exclude send_license from boolean treatment even though it's tinyint(1)
    if (column.name === 'send_license') return false;
    
    return column.type === 'tinyint(1)' || 
           column.name.startsWith('is_') || 
           ['active', 'featured', 'trending'].includes(column.name);
  };

  const isStatusColumn = (column) => {
    return column.name === 'status' || column.name.endsWith('_status');
  };

  const isCurrencyColumn = (column) => {
    return ['price', 'amount', 'old_price', 'new_price'].includes(column.name) ||
           column.name.includes('_price');
  };

  const isLongText = (text) => {
    return text && typeof text === 'string' && text.length > 50;
  };

  const truncateText = (text, length = 50) => {
    if (!text || typeof text !== 'string') return text;
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const options = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(date).toLocaleDateString('id-ID', options);
    } catch (e) {
      return date;
    }
  };

  const formatStatus = (status) => {
    if (!status || typeof status !== 'string') return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return {
    getTableIcon,
    formatColumnName,
    isDateColumn,
    isBooleanColumn,
    isStatusColumn,
    isCurrencyColumn,
    isLongText,
    truncateText,
    formatDate,
    formatStatus,
    formatCurrency,
  };
} 