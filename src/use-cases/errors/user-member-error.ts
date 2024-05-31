export class UserMemberError extends Error {
  constructor() {
    super('Accept only ADMIN or MEMBER roles.')
  }
}
