export const pagingSkipValue = (page, itemsPerPage) => {
  const pageNum = parseInt(page, 10);
  const itemsNum = parseInt(itemsPerPage, 10);
  if (isNaN(pageNum) || isNaN(itemsNum) || pageNum <= 0 || itemsNum <= 0)
    return 0;
  const skipValue = (pageNum - 1) * itemsNum;
  console.log('SKIP:', skipValue, 'LIMIT:', itemsNum);
  return skipValue;
};
