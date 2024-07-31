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
  async index({ response }: HttpContext) {
    try {
      const clients = await Client.query().select('id', 'name', 'cpf').orderBy('id', 'asc')
      return response.status(200).json(clients)
    } catch (error) {
      return response.status(400).json({ message: 'Error fetching clients', error })
    }
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

  async show({ params, request, response }: HttpContext) {
    // Obtém o ID do cliente dos parâmetros da rota
    const clientId = params.id

    // Obtém os parâmetros de mês e ano da query string (para filtragem)
    const { month, year } = request.qs()

    try {
      // Tenta encontrar o cliente pelo ID, lança um erro se não encontrado
      const client = await Client.findOrFail(clientId)

      // Cria uma query para buscar as vendas do cliente, ordenadas pela data de venda em ordem decrescente
      let salesQuery = Sale.query().where('client_id', clientId).orderBy('sale_date', 'desc')

      // Se os parâmetros de mês e ano estão presentes, adiciona filtros para eles na query
      if (month && year) {
        salesQuery = salesQuery
          .whereRaw('MONTH(sale_date) = ?', [month]) // Filtra pelo mês da venda
          .andWhereRaw('YEAR(sale_date) = ?', [year]) // Filtra pelo ano da venda
      }

      // Executa a query e obtém as vendas
      const sales = await salesQuery.exec()

      // Retorna a resposta com o cliente e suas vendas
      return response.status(200).json({
        client: {
          id: client.id,
          name: client.name,
          cpf: client.cpf,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        },
        sales
      })
    } catch (error) {
      // Em caso de erro, retorna uma resposta de erro
      return response.status(400).json({ message: 'Error fetching client details', error })
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
    // Obtém o ID do cliente dos parâmetros da rota
    const clientId = params.id
    const { name, cpf, addresses, phones, sales } = request.only(['name', 'cpf', 'addresses', 'phones', 'sales'])

    // Início da transação
    const trx = await Database.transaction()

    try {
      // Obtém o cliente
      const client = await Client.findOrFail(clientId)
      client.name = name
      client.cpf = cpf
      client.useTransaction(trx)
      await client.save()

      // Atualiza os endereços do cliente
      if (addresses && addresses.length > 0) {
        await Address.query({ client: trx }).where('client_id', clientId).delete()
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

      // Atualiza os telefones do cliente
      if (phones && phones.length > 0) {
        await Phone.query({ client: trx }).where('client_id', clientId).delete()
        for (const phoneData of phones) {
          const phone = new Phone()
          phone.number = phoneData.number
          phone.client_id = client.id
          phone.useTransaction(trx)
          await phone.save()
        }
      }


      // Atualiza as vendas do cliente
      if (sales && sales.length > 0) {
        await Sale.query({ client: trx }).where('client_id', clientId).delete()
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
      return response.status(200).json(client)
    } catch (error) {
      // Rollback em caso de erro
      await trx.rollback()
      return response.status(400).json({ message: 'Error updating client', error })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const clientId = params.id

    // Início da transação
    const trx = await Database.transaction()

    try {
      // Obtém o cliente e todas as vendas associadas
      const client = await Client.findOrFail(clientId)

      // Exclui as vendas associadas
      await Sale.query({ client: trx }).where('client_id', clientId).delete()

      // Exclui os endereços associados
      await Address.query({ client: trx }).where('client_id', clientId).delete()

      // Exclui os telefones associados
      await Phone.query({ client: trx }).where('client_id', clientId).delete()

      // Exclui o cliente
      await client.useTransaction(trx).delete()

      // Commit da transação se tudo der certo
      await trx.commit()

      return response.status(200).json({ message: 'Client and related sales, addresses, and phones deleted successfully' })
    } catch (error) {
      // Rollback em caso de erro
      await trx.rollback()
      return response.status(400).json({ message: 'Error deleting client and related sales', error })
    }
  }
}