import { FaqQuery } from './FaqQuery';

export class FaqCategory {
  id: number;
  name: string;
  sequence: number;
  active: boolean;
  faqQueries: FaqQuery[];
}
