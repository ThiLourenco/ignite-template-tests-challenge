import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create new user", async () => {
    const result = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@admin.com",
      password: "1234",
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to create new user when email is already taken", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Jane Doe",
        email: "Jane@admin.com",
        password: "123456",
      }

      await createUserUseCase.execute(user);

      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
})
