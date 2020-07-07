import CreateTransactionService from './CreateTransactionService';
import CreateCategoryService from './CreateCategoryService';

import Transaction from '../models/Transaction';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(transactionsImported: Array<Request>): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const createCategory = new CreateCategoryService();

    const transactions = [] as Transaction[];

    transactionsImported.forEach(async transaction => {
      const category = await createCategory.execute({
        category: transaction.category,
      });

      const newTransaction = await createTransaction.execute({
        ...transaction,
        category_id: category.id,
      });

      transactions.push({ ...newTransaction });
    });

    return transactions;
  }
}

export default ImportTransactionsService;
