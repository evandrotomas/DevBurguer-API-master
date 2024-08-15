import * as Yup from 'yup'
import Order from '..//schemas/Order'
import Product from '../models/Product'
import Category from '../models/Category'
import User from '../models/User'

class Order_controller {
  async store(request, response) {
    const schema = Yup.object({
      products: Yup.array()
        .required()
        .of(
          Yup.object({
            id: Yup.number().required(),
            quantity: Yup.number().required(),
          }),
        ),
    })

    try {
      schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { products } = request.body

    const products_ids = products.map((product) => product.id)

    const find_products = await Product.findAll({
      where: {
        id: products_ids,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    })

    const formatted_products = find_products.map((product) => {
      const product_index = products.findIndex((item) => item.id === product.id)

      const new_product = {
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: product.price,
        url: product.url,
        quantity: products[product_index].quantity,
      }

      return new_product
    })

    const order = {
      user: {
        id: request.user_id,
        name: request.user_name,
      },
      products: formatted_products,
      status: 'Pedido realizado',
    }

    const created_order = await Order.create(order)

    return response.status(201).json(created_order)
  }
  async index(request, response) {
    const orders = await Order.find()

    return response.json(orders)
  }

  async update(request, response) {
    const schema = Yup.object({
      status: Yup.string().required(),
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
    const { status } = request.body

    try {
      await Order.updateOne({ _id: id }, { status })
    } catch (err) {
      return response.status(400).json({ error: err.message })
    }

    return response.json({ message: 'Status updated sucessfully' })
  }
}

export default new Order_controller()
