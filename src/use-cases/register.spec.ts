import { describe, it, beforeEach, expect } from 'vitest'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user--already-exists-error'
import { UserMemberError } from './errors/user-member-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should be able to register', async () => {
    const { user } = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: '123456',
      role: 'MEMBER',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: '123456',
      role: 'MEMBER',
    })

    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const email = 'jhonedoe@example.com'

    await sut.execute({
      name: 'jhon doe',
      email,
      password: '123456',
      role: 'MEMBER',
    })

    await expect(() =>
      sut.execute({
        name: 'jhon doe',
        email,
        password: '123456',
        role: 'MEMBER',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should be able send MEMBER role', async () => {
    const { user } = await sut.execute({
      name: 'jhon doe',
      email: 'jhondoe@example.com',
      password: '123456',
      role: 'MEMBER',
    })

    expect(user.role).toEqual('MEMBER')
  })

  it('should be able send ADMIN role', async () => {
    const { user } = await sut.execute({
      name: 'jhon doe',
      email: 'jhondoe@example.com',
      password: '123456',
      role: 'ADMIN',
    })

    expect(user.role).toEqual('ADMIN')
  })

  it('should not be able to register with a role different from ADMIN or MEMBER', async () => {
    expect(() =>
      sut.execute({
        name: 'jhon doe',
        email: 'jhondoe@example.com',
        password: '123456',
        role: 'other role',
      }),
    ).rejects.toBeInstanceOf(UserMemberError)
  })
})
