import type { HttpContext } from '@adonisjs/core/http'
import Client from '../models/client.js'
import Address from '../models/address.js'
import Phone from '../models/phone.js'
import Sale from '../models/sale.js'
import Product from '../models/product.js'

export default class ProductsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const products = await Product.query().select('id', 'name', 'price').orderBy('name', 'asc')
      return response.status(200).json(products)
    } catch (error) {
      return response.status(400).json({ message: 'Error fetching products', error })
    }
  }


  /**
   * Display form to create a new record
   */
  async create({ }: HttpContext) { }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) { }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id)
      return response.status(200).json(product)
    } catch (error) {
      return response.status(404).json({ message: 'Product not found', error })
    }
  }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) { }

  /**
   * Handle form submission for the edit action
   */
  // async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) { }
}