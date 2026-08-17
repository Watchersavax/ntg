export class PageParam {
  page: number;
  size: number;
  keyword: string;
  sort: string;
  order: string;

  constructor() {
    this.page = 0;
    this.size = 15;
    this.keyword = '';
    this.sort = '';
    this.order = '';
  }

  reset() {
    this.page = 0;
    this.size = 15;
  }
}
