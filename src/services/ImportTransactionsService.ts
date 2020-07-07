import Transaction from '../models/Transaction';

interface Request {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(transactionsImported: Array<Request>): Promise<Transaction[]> {
    // TODO
  }
}

export default ImportTransactionsService;
