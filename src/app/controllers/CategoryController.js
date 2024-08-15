import * as Yup from 'yup'
import Category from '../models/Category'
import User from '../models/User'

class Category_controller {
  async store(request, response) {
    const schema = Yup.object({
      name: Yup.string().required(),
    })

    try {
      schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { admin: is_admin } = await User.findByPk(request.user_id)

    if (!is_admin) {
      return response.status(401).json()
    }

    const { filename: path } = request.file
    const { name } = request.body

    const category_exist = await Category.findOne({
      where: {
        name,
      },
    })

    if (category_exist) {
      return response.status(400).json({ error: 'Category already exist!' })
    }

    const { id } = await Category.create({
      name,
      path,
    })

    return response.status(201).json({ id, name })
  }

  async update(request, response) {
    const schema = Yup.object({
      name: Yup.string(),
    })

    try {
      schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { admin: is_admin } = await User.findByPk(request.user_id)

    if (!is_admin) {
      return response.status(401).json()
    }

    const { id } = request.params

    const category_exist = await Category.findByPk(id)

    if (!category_exist) {
      return response
        .status(400)
        .json({ message: 'Make sure your category ID is corret' })
    }

    let path
    if (request.file) {
      path = request.file.filename
    }

    const { name } = request.body

    if (name) {
      const category_name_exist = await Category.findOne({
        where: {
          name,
        },
      })

      if (category_name_exist && category_name_exist.id != id) {
        return response.status(400).json({ error: 'Category already exist!' })
      }
    }

    await Category.update(
      {
        name,
        path,
      },
      {
        where: {
          id,
        },
      },
    )

    return response.status(200).json()
  }

  async index(request, response) {
    const categories = await Category.findAll()

    return response.json(categories)
  }
}

export default new Category_controller()
