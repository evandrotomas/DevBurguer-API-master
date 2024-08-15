import * as Yup from 'yup'
import User from '../models/User'
import jwt from 'jsonwebtoken'
import auth_config from '../../config/auth'

class SessionControler {
  async store(request, response) {
    const schema = Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    })

    const is_valid = await schema.isValid(request.body)

    const email_or_password_incorrect = () => {
      response
        .status(401)
        .json({ error: 'Make sure your email or password is correct' })
    }

    if (!is_valid) {
      return email_or_password_incorrect()
    }

    const { email, password } = request.body

    const user = await User.findOne({
      where: {
        email,
      },
    })

    if (!user) {
      return email_or_password_incorrect()
    }

    const is_same_password = await user.compare_password(password)

    if (!is_same_password) {
      return email_or_password_incorrect()
    }

    return response.status(201).json({
      id: user.id,
      name: user.name,
      email,
      admin: user.admin,
      token: jwt.sign({ id: user.id, name: user.name }, auth_config.secret, {
        expiresIn: auth_config.expires_in,
      }),
    })
  }
}

export default new SessionControler()
