import type { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/services/db'
import Client from '../models/client.js'
import Product from '../models/product.js'
import Sale from '../models/sale.js'
import { DateTime } from 'luxon'

export default class SalesController {
  /**
   * Create a new sale
   */
  async store({ request, response }: HttpContext) {
    const trx = await Database.transaction()
    try {
      const { clientId, productId, quantity } = request.only(['clientId', 'productId', 'quantity'])
      // Verifica se o cliente existe
      const client: Client | null = await Client.find(clientId)
      if (!client) {
        await trx.rollback()
        return response.status(404).json({ message: 'Client not found' })
      }

      // Verifica se o produto existe e não está deletado
      const product = await Product.query().where('id', productId).andWhere('is_deleted', false).first()
      if (!product) {
        await trx.rollback()
        return response.status(404).json({ message: 'Product not found or is deleted' })
      }

      // Calcula os valores da venda
      const unitPrice = product.price
      const totalPrice = unitPrice * quantity

      // Cria a venda
      const sale = new Sale()
      sale.client_id = clientId
      sale.product_id = productId
      sale.quantity = quantity
      sale.unit_price = unitPrice
      sale.total_price = totalPrice
      sale.sale_date = DateTime.now()
      sale.useTransaction(trx)
      await sale.save()

      await trx.commit()
      return response.status(201).json(sale)
    } catch (error) {
      await trx.rollback()
      return response.status(400).json({ message: 'Error creating sale', error })
    }

  }
}