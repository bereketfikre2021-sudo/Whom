/**
 * Returns a clean English display label for a category,
 * regardless of whether the DB stores the name in Amharic or English.
 */
export const categoryLabel = (category) => {
  if (!category) return '';
  const slug = category.slug || '';
  if (slug === 'construction-workers') return 'Construction Workers';
  if (slug === 'houses-for-rent')      return 'Houses for Rent';
  if (slug === 'tutors')               return 'Tutors';
  // fallback: return as-is if slug is unknown
  return category.name || '';
};
