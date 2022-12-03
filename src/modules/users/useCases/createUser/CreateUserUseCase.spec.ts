import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let newUser: ICreateUserDTO;

describe("Create User", () => {
  beforeAll(() => {
    newUser = {
      name: "John Doe",
      email: "johndoe@admin.com",
      password: "1234",
    };
  });

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create new user", async () => {
    await createUserUseCase.execute(newUser);

    const createdUser = await usersRepositoryInMemory.findByEmail(
      newUser.email
    );
    expect(createdUser).toHaveProperty("id");
  });

  it("should not be able to create new user when email is already taken", async () => {
    await createUserUseCase.execute(newUser);

    expect(async () => {
      await createUserUseCase.execute(newUser);
    }).rejects.toBeInstanceOf(AppError);
  });
});
