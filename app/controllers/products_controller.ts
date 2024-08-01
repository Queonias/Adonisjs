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
      const products = await Product.query().where('is_deleted', false).select('id', 'name', 'price').orderBy('name', 'asc')
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
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'price', 'description'])
      const product = await Product.create(data)
      return response.status(201).json(product)
    } catch (error) {
      return response.status(400).json({ message: 'Error creating product', error })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const product = await Product.query().where('id', params.id).andWhere('is_deleted', false).firstOrFail()
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
  async update({ params, request, response }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id)
      const data = request.only(['name', 'price', 'description'])

      product.merge(data)
      await product.save()

      return response.status(200).json(product)
    } catch (error) {
      return response.status(400).json({ message: 'Error updating product', error })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id)
      product.is_deleted = true
      await product.save()
      return response.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      return response.status(400).json({ message: 'Error deleting product', error })
    }
  }
}