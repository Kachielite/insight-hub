class PaginationResponseDTO<T> {
  items: T[];
  totalCount: number;
  size: number;
  currentPage: number;

  constructor(
    items: T[],
    totalCount: number,
    size: number,
    currentPage: number
  ) {
    this.items = items;
    this.totalCount = totalCount;
    this.size = size;
    this.currentPage = currentPage;
  }
}

export default PaginationResponseDTO;
