export const calculateGraduationYear = (yearOfStudy) => {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-based
  const academicYearStart = month >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  const yearsRemaining = 4 - yearOfStudy;
  return academicYearStart + yearsRemaining;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
