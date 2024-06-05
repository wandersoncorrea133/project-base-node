import { FastifyReply, FastifyRequest } from 'fastify'

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  console.log('Request cookies:', request.cookies)
  await request.jwtVerify({ onlyCookie: true })

  const { role } = request.user

  const user = request.user

  const token = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
      },
    },
  )

  const refreshToken = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
        expiresIn: '7d',
      },
    },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: false,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({
      user: { ...user, password_hash: undefined, token },
    })
}
