import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let newUser: ICreateUserDTO;

describe('Create Statement', () => {
  beforeAll(async () => {
    newUser = {
      name: "John Doe",
      email: "johndoe@admin.com",
      password: await hash('123', 8),
    }
  });

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it('should be able to create a new statement', async () => {
    await usersRepositoryInMemory.create(newUser);

    const user = await usersRepositoryInMemory.findByEmail(newUser.email);

    let userId = user?.id;

    if (!userId) {
      userId = 'Invalid-id'
    }

    await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit of 100'
    });

    const response = await  createStatementUseCase.execute({
      user_id: userId,
      amount: 60,
      description: 'Xpto description',
      type: OperationType.DEPOSIT,
    });

    expect(response).toHaveProperty('id');
    expect(response.user_id).toBe(userId);
  })

  it('should not be able to create a statement with an non-existent user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'Invalid-id',
        amount: 100,
        description: 'Xpto description',
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(AppError);
  })


  it('should not be able to create a new statement if have insufficient funds', async () => {
    expect(async () => {
    await usersRepositoryInMemory.create(newUser);

    const user = await usersRepositoryInMemory.findByEmail(newUser.email);

    let userId = user?.id;

    if (!userId) {
      userId = 'Invalid-id'
    }

    await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'Deposit of 100'
    });
    }).rejects.toBeInstanceOf(AppError);
  })
})
