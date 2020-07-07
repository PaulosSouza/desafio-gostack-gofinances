import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import loadCSV from '../utils/loadCsv';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionRepository.getBalance();
  const transactions = await transactionRepository.find({
    relations: ['category'],
    select: ['id', 'title', 'type', 'value', 'created_at', 'updated_at'],
  });

  return response.json({ balance, transactions });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createCategory = new CreateCategoryService();
  const createTransaction = new CreateTransactionService();

  const categoryCreated = await createCategory.execute({ category });

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category_id: categoryCreated.id,
  });

  transaction.category = category;

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { path } = request.file;

    const transactionsUnformmated = await loadCSV(path);

    const transactionsFormatted = [] as Array<TransactionDTO>;

    transactionsUnformmated.forEach(transactionline => {
      const [title, type, value, category] = transactionline;

      const transaction = {
        title,
        type,
        value: Number(value),
        category,
      } as TransactionDTO;

      transactionsFormatted.push(transaction);
    });

    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(
      transactionsFormatted,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
