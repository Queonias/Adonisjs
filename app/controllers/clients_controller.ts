import type { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Client from '../models/client.js'
import Address from '../models/address.js'
import Phone from '../models/phone.js'
import Sale from '../models/sale.js'
import Product from '../models/product.js'

export default class ClientsController {
  /**
   * Display a list of resource
   */
  async index({ }: HttpContext) {

  }

  /**
   * Display form to create a new record
   */
  async create({ }: HttpContext) { }

  /**
   * Salvar
   */
  async store({ request, response }: HttpContext) {
    // Início da transação
    const trx = await Database.transaction()
    try {
      // Cria e salva um novo cliente usando a transação
      const { name, cpf, addresses, phones, sales } = request.only(['name', 'cpf', 'addresses', 'phones', 'sales'])
      const client = new Client()
      client.name = name
      client.cpf = cpf
      client.useTransaction(trx)
      await client.save()

      // Salva os endereços, telefones e vendas do cliente
      if (addresses && addresses.length > 0) {
        for (const addressData of addresses) {
          const address = new Address()
          address.street = addressData.street
          address.number = addressData.number
          address.neighborhood = addressData.neighborhood
          address.city = addressData.city
          address.state = addressData.state
          address.postal_code = addressData.zipCode
          address.client_id = client.id
          address.useTransaction(trx)
          await address.save()
        }
      }

      // Salva os telefones do cliente
      if (phones && phones.length > 0) {
        for (const phoneData of phones) {
          const phone = new Phone()
          phone.number = phoneData.number
          phone.client_id = client.id
          phone.useTransaction(trx)
          await phone.save()
        }
      }

      // Salva as vendas do cliente
      if (sales && sales.length > 0) {
        for (const saleData of sales) {
          // Verifica se o produto existe
          const product = await Product.find(saleData.productId)
          if (!product) {
            // Rollback se o produto não existir
            await trx.rollback()
            return response.status(400).json({ message: `Product with ID ${saleData.productId} does not exist` })
          }
          const sale = new Sale()
          sale.product_id = saleData.productId
          sale.quantity = saleData.quantity
          sale.unit_price = saleData.totalPrice / saleData.quantity
          sale.total_price = saleData.totalPrice
          sale.client_id = client.id
          sale.sale_date = DateTime.now()
          sale.useTransaction(trx)
          await sale.save()
        }
      }


      // Commit da transação se tudo der certo
      await trx.commit()
      return response.status(201).json(client)

    } catch (error) {
      // Rollback em caso de erro
      await trx.rollback()
      return response.status(400).json({ message: 'Error saving client', error })
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