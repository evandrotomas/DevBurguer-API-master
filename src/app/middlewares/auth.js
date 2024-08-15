/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken'
import auth_config from '../../config/auth'

function auth_middleware(request, response, next) {
  console.log(request.headers)
  const auth_token = request.headers.authorization

  if (!auth_token) {
    return response.status(401).json({ error: 'Token not provide' })
  }

  const token = auth_token.split(' ').at(1)

  try {
    jwt.verify(token, auth_config.secret, (err, decoded) => {
      if (err) {
        throw new Error()
      }

      request.user_id = decoded.id
      request.user_name = decoded.name
    })
  } catch (err) {
    return response.status(401).json({ error: 'Token is invalid' })
  }

  return next()
}

export default auth_middleware
