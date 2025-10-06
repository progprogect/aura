/**
 * MongoDB клиент для работы с embeddings
 */

import { MongoClient, Db, Collection } from 'mongodb'

// Используем MONGO_URL (Railway internal) или MONGODB_URL (fallback для других платформ)
const MONGODB_URL = process.env.MONGO_URL || process.env.MONGODB_URL
const DB_NAME = 'aura'
const COLLECTION_NAME = 'specialist_embeddings'

let client: MongoClient | null = null
let db: Db | null = null

/**
 * Подключение к MongoDB
 */
async function connect(): Promise<Db> {
  if (db) return db

  if (!MONGODB_URL) {
    throw new Error('MONGO_URL or MONGODB_URL is not set in environment variables')
  }

  if (!client) {
    client = new MongoClient(MONGODB_URL)
    await client.connect()
    console.log('[MongoDB] Connected successfully')
  }

  db = client.db(DB_NAME)
  return db
}

/**
 * Получить коллекцию embeddings
 */
export async function getEmbeddingsCollection(): Promise<Collection> {
  const database = await connect()
  return database.collection(COLLECTION_NAME)
}

/**
 * Интерфейс для embedding документа
 */
export interface EmbeddingDocument {
  specialistId: string
  embedding: number[]
  sourceText: string
  modelVersion: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Сохранить или обновить embedding
 */
export async function saveEmbedding(
  specialistId: string,
  embedding: number[],
  sourceText: string,
  modelVersion: string
): Promise<void> {
  const collection = await getEmbeddingsCollection()

  await collection.updateOne(
    { specialistId },
    {
      $set: {
        specialistId,
        embedding,
        sourceText,
        modelVersion,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
}

/**
 * Получить embedding по specialistId
 */
export async function getEmbedding(specialistId: string): Promise<EmbeddingDocument | null> {
  const collection = await getEmbeddingsCollection()
  return await collection.findOne({ specialistId }) as EmbeddingDocument | null
}

/**
 * Получить все embeddings
 */
export async function getAllEmbeddings(): Promise<EmbeddingDocument[]> {
  const collection = await getEmbeddingsCollection()
  const results = await collection.find({}).toArray()
  return results as unknown as EmbeddingDocument[]
}

/**
 * Удалить embedding
 */
export async function deleteEmbedding(specialistId: string): Promise<void> {
  const collection = await getEmbeddingsCollection()
  await collection.deleteOne({ specialistId })
}

/**
 * Подсчитать количество embeddings
 */
export async function countEmbeddings(): Promise<number> {
  const collection = await getEmbeddingsCollection()
  return await collection.countDocuments()
}

/**
 * Создать индекс для specialistId (для быстрого поиска)
 */
export async function createIndexes(): Promise<void> {
  const collection = await getEmbeddingsCollection()
  await collection.createIndex({ specialistId: 1 }, { unique: true })
  console.log('[MongoDB] Indexes created')
}

/**
 * Cosine similarity между двумя векторами
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)

  if (magnitude === 0) {
    return 0
  }

  return dotProduct / magnitude
}

/**
 * Найти топ-N наиболее похожих embeddings
 */
export async function findSimilarEmbeddings(
  queryEmbedding: number[],
  limit: number = 20,
  excludeIds: string[] = []
): Promise<Array<{ specialistId: string; similarity: number }>> {
  const collection = await getEmbeddingsCollection()

  // Получаем все embeddings (для <10k записей это быстро)
  const filter = excludeIds.length > 0 ? { specialistId: { $nin: excludeIds } } : {}
  const results = await collection.find(filter).toArray()
  const allEmbeddings = results as unknown as EmbeddingDocument[]

  // Вычисляем cosine similarity для каждого
  const similarities = allEmbeddings.map((doc) => ({
    specialistId: doc.specialistId,
    similarity: cosineSimilarity(queryEmbedding, doc.embedding),
  }))

  // Сортируем по убыванию similarity
  similarities.sort((a, b) => b.similarity - a.similarity)

  // Возвращаем топ-N
  return similarities.slice(0, limit)
}

/**
 * Закрыть соединение (при завершении приложения)
 */
export async function disconnect(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('[MongoDB] Disconnected')
  }
}

